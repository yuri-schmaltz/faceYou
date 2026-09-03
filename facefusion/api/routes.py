import os
import shutil
import uuid
import json
import datetime
import sys
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from facefusion import state_manager
from facefusion.execution import get_available_execution_providers, detect_static_execution_devices
from facefusion.filesystem import resolve_file_paths, get_file_name, create_directory, get_default_path
from facefusion.processors.core import get_processors_modules
from facefusion.jobs import job_manager, job_runner, job_helper
from facefusion.args import collect_step_args
from facefusion.core import process_step
from facefusion.api.database import get_db, JobModel, SessionLocal

router = APIRouter()


def get_user_projects_dir() -> str:
    home = os.path.expanduser("~")
    videos_dir = os.path.join(home, "Vídeos")
    if not os.path.exists(videos_dir):
        videos_dir = os.path.join(home, "Videos")
    if not os.path.exists(videos_dir):
        videos_dir = os.path.join(home, "Videos")
        os.makedirs(videos_dir, exist_ok=True)
    projects_dir = os.path.join(videos_dir, "FaceFusion_Projects")
    os.makedirs(projects_dir, exist_ok=True)
    return os.path.abspath(projects_dir)


def get_allowed_directories() -> List[str]:
    jobs_path = state_manager.get_item("jobs_path") or get_default_path('data')
    temp_path = state_manager.get_item("temp_path") or get_default_path('temp')
    cache_path = get_default_path('cache')
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    return [
        os.path.abspath(jobs_path),
        os.path.abspath(temp_path),
        os.path.abspath(cache_path),
        get_user_projects_dir(),
        root_dir
    ]


def validate_safe_path(target_path: str, allowed_dirs: Optional[List[str]] = None) -> str:
    if allowed_dirs is None:
        allowed_dirs = get_allowed_directories()
    abs_target = os.path.abspath(target_path)
    for allowed in allowed_dirs:
        abs_allowed = os.path.abspath(allowed)
        try:
            if os.path.commonpath([abs_target, abs_allowed]) == abs_allowed:
                return abs_target
        except ValueError:
            continue
    raise HTTPException(status_code=400, detail=f"Acesso negado: o arquivo '{target_path}' reside fora dos diretórios autorizados.")



class FaceMapping(BaseModel):
    source_path: str
    target_face_index: int
    reference_frame_number: int


class JobCreateRequest(BaseModel):
    project_name: Optional[str] = None
    source_paths: List[str]
    target_path: str
    face_swapper_weight: Optional[float] = 0.5
    face_mask_blur: Optional[float] = 0.3
    detection_threshold: Optional[float] = 0.5
    smoothing: Optional[int] = 5
    processors: Optional[List[str]] = ["face_swapper"]
    output_format: Optional[str] = "mp4"
    trim_frame_start: Optional[int] = None
    trim_frame_end: Optional[int] = None
    face_swapper_model: Optional[str] = "hyperswap_1a_256"
    face_swapper_pixel_boost: Optional[str] = None
    face_enhancer_model: Optional[str] = "gfpgan_1.4"
    face_enhancer_blend: Optional[int] = 80
    face_enhancer_weight: Optional[float] = 1.0
    frame_enhancer_model: Optional[str] = "span_kendata_x4"
    frame_enhancer_blend: Optional[int] = 80
    # Additional processors options
    face_editor_model: Optional[str] = None
    face_editor_eyebrow_direction: Optional[float] = None
    face_editor_eye_gaze_horizontal: Optional[float] = None
    face_editor_eye_gaze_vertical: Optional[float] = None
    face_editor_eye_open_ratio: Optional[float] = None
    face_editor_lip_open_ratio: Optional[float] = None
    face_editor_mouth_smile: Optional[float] = None
    face_editor_head_pitch: Optional[float] = None
    face_editor_head_yaw: Optional[float] = None
    face_editor_head_roll: Optional[float] = None
    age_modifier_model: Optional[str] = None
    age_modifier_direction: Optional[int] = None
    lip_syncer_model: Optional[str] = None
    lip_syncer_weight: Optional[float] = None
    expression_restorer_model: Optional[str] = None
    expression_restorer_factor: Optional[float] = None
    # Additional 5 processors
    deep_swapper_model: Optional[str] = None
    deep_swapper_morph: Optional[int] = None
    face_debugger_items: Optional[List[str]] = None
    frame_colorizer_model: Optional[str] = None
    frame_colorizer_blend: Optional[int] = None
    frame_colorizer_size: Optional[str] = None
    background_remover_model: Optional[str] = None
    background_remover_color: Optional[List[int]] = None
    output_audio_encoder: Optional[str] = "aac"
    output_audio_quality: Optional[int] = 80
    output_audio_volume: Optional[int] = 100
    output_video_encoder: Optional[str] = "libx264"
    output_video_preset: Optional[str] = "medium"
    mappings: Optional[List[FaceMapping]] = None


@router.get("/hardware/providers")
def get_hardware_providers() -> List[str]:
    """
    Retorna todos os provedores de execução (hardware acceleration) disponíveis na máquina.
    """
    try:
        providers = get_available_execution_providers()
        return [str(p) for p in providers]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler provedores de hardware: {str(e)}")


@router.get("/hardware/devices")
def get_hardware_devices() -> List[Dict[str, Any]]:
    """
    Retorna detalhes de temperatura, memória e uso dos dispositivos NVIDIA (GPUs) detectados.
    """
    try:
        devices = detect_static_execution_devices()
        return [dict(device) for device in devices]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao detectar dispositivos NVIDIA: {str(e)}")


@router.get("/hardware/telemetry")
def get_hardware_telemetry() -> Dict[str, Any]:
    """
    Retorna telemetria completa de uso de CPU, GPU, RAM e VRAM em tempo real.
    """
    try:
        import psutil
        cpu_pct = psutil.cpu_percent(interval=None)
        vm = psutil.virtual_memory()

        gpu_data = {
            "name": "GPU",
            "temperature_c": None,
            "usage_percent": None,
            "vram_total_gb": 0.0,
            "vram_used_gb": 0.0,
            "vram_free_gb": 0.0,
            "vram_usage_percent": 0.0
        }

        devices = detect_static_execution_devices()
        if devices:
            d = devices[0]
            gpu_data["name"] = d.get("product", {}).get("name", "NVIDIA GPU")
            gpu_data["temperature_c"] = d.get("temperature", {}).get("gpu", {}).get("value")
            gpu_data["usage_percent"] = d.get("utilization", {}).get("gpu", {}).get("value")

            vm_total = d.get("video_memory", {}).get("total", {}).get("value", 0)
            vm_free = d.get("video_memory", {}).get("free", {}).get("value", 0)
            vm_used = max(0, vm_total - vm_free)

            gpu_data["vram_total_gb"] = round(vm_total / 1024.0, 1)
            gpu_data["vram_used_gb"] = round(vm_used / 1024.0, 1)
            gpu_data["vram_free_gb"] = round(vm_free / 1024.0, 1)
            if vm_total > 0:
                gpu_data["vram_usage_percent"] = round((vm_used / vm_total) * 100.0, 1)

        return {
            "cpu": {
                "usage_percent": round(cpu_pct, 1),
                "cores": psutil.cpu_count(logical=True)
            },
            "ram": {
                "total_gb": round(vm.total / (1024**3), 1),
                "used_gb": round(vm.used / (1024**3), 1),
                "free_gb": round(vm.available / (1024**3), 1),
                "usage_percent": round(vm.percent, 1)
            },
            "gpu": gpu_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao coletar telemetria de hardware: {str(e)}")


@router.get("/processors/list")
def get_available_processors() -> List[str]:
    """
    Retorna a lista de processadores de frame disponíveis no sistema.
    """
    try:
        processors_paths = resolve_file_paths("facefusion/processors/modules")
        names = [get_file_name(path) for path in processors_paths]
        return [name for name in names if name is not None]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao varrer processadores: {str(e)}")


@router.get("/config")
def get_current_config() -> Dict[str, Any]:
    """
    Retorna as configurações e o estado global atual da aplicação em execução.
    """
    try:
        return {
            "temp_path": state_manager.get_item("temp_path"),
            "jobs_path": state_manager.get_item("jobs_path"),
            "log_level": state_manager.get_item("log_level"),
            "execution_providers": state_manager.get_item("execution_providers"),
            "execution_thread_count": state_manager.get_item("execution_thread_count"),
            "video_memory_strategy": state_manager.get_item("video_memory_strategy"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler configuração do estado: {str(e)}")


class ConfigUpdateRequest(BaseModel):
    temp_path: Optional[str] = None
    jobs_path: Optional[str] = None
    log_level: Optional[str] = None
    execution_providers: Optional[List[str]] = None
    execution_thread_count: Optional[int] = None
    video_memory_strategy: Optional[str] = None


@router.post("/config")
def update_config(request: ConfigUpdateRequest) -> Dict[str, Any]:
    """
    Atualiza as configurações do estado em memória.
    """
    try:
        if request.temp_path is not None:
            state_manager.set_item("temp_path", request.temp_path)
        if request.jobs_path is not None:
            state_manager.set_item("jobs_path", request.jobs_path)
        if request.log_level is not None:
            state_manager.set_item("log_level", request.log_level)
        if request.execution_providers is not None:
            state_manager.set_item("execution_providers", request.execution_providers)
        if request.execution_thread_count is not None:
            state_manager.set_item("execution_thread_count", request.execution_thread_count)
        if request.video_memory_strategy is not None:
            state_manager.set_item("video_memory_strategy", request.video_memory_strategy)
        return {"status": "success", "config": get_current_config()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar configuração: {str(e)}")


@router.post("/media/upload")
def upload_media(file: UploadFile = File(...)):
    """
    Faz o upload de uma imagem ou vídeo para a pasta temporária de jobs.
    """
    try:
        jobs_path = state_manager.get_item("jobs_path") or get_default_path('data')
        uploads_dir = os.path.join(jobs_path, "uploads")
        create_directory(uploads_dir)
        
        filename = file.filename or "file"
        file_ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(uploads_dir, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "file_path": os.path.abspath(file_path),
            "filename": filename,
            "unique_filename": unique_filename,
            "url": f"/api/media/upload/{unique_filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no upload da mídia: {str(e)}")


@router.get("/media/upload/{filename:path}")
def get_upload_file(filename: str):
    """
    Retorna um arquivo de mídia enviado para a pasta temporária ou recortes de análise.
    """
    jobs_path = state_manager.get_item("jobs_path") or get_default_path('data')
    uploads_dir = os.path.abspath(os.path.join(jobs_path, "uploads"))
    file_path = os.path.abspath(os.path.join(uploads_dir, filename))
    
    # Previne path traversal
    safe_path = validate_safe_path(file_path, [uploads_dir])
        
    if os.path.exists(safe_path):
        return FileResponse(safe_path)
    raise HTTPException(status_code=404, detail="Arquivo de mídia não encontrado")


@router.get("/media/output/{filename:path}")
def get_output_file(filename: str):
    """
    Retorna o arquivo final gerado pelo processamento.
    """
    jobs_path = state_manager.get_item("jobs_path") or get_default_path('data')
    outputs_dir = os.path.abspath(os.path.join(jobs_path, "outputs"))
    file_path = os.path.abspath(os.path.join(outputs_dir, filename))
    
    # Previne path traversal
    safe_path = validate_safe_path(file_path, [outputs_dir])
        
    if os.path.exists(safe_path):
        return FileResponse(safe_path)
    raise HTTPException(status_code=404, detail="Arquivo de mídia não encontrado")


@router.get("/projects")
def list_projects() -> List[Dict[str, Any]]:
    """
    Lista todas as pastas de projetos criadas em ~/Vídeos/FaceFusion_Projects/
    com seus respectivos arquivos de origem, destino, produto final e metadados.
    """
    try:
        projects_dir = get_user_projects_dir()
        projects = []

        if not os.path.exists(projects_dir):
            return []

        for entry in os.scandir(projects_dir):
            if entry.is_dir():
                proj_name = entry.name
                proj_path = entry.path
                meta_path = os.path.join(proj_path, "project.json")
                meta = {}
                if os.path.exists(meta_path):
                    try:
                        with open(meta_path, "r", encoding="utf-8") as f:
                            meta = json.load(f)
                    except Exception:
                        pass

                source_dir = os.path.join(proj_path, "source")
                target_dir = os.path.join(proj_path, "target")
                output_dir = os.path.join(proj_path, "output")

                sources = [f for f in os.listdir(source_dir)] if os.path.exists(source_dir) else []
                targets = [f for f in os.listdir(target_dir)] if os.path.exists(target_dir) else []
                outputs = [f for f in os.listdir(output_dir)] if os.path.exists(output_dir) else []

                has_output = len(outputs) > 0
                status = meta.get("status") or ("completed" if has_output else "queued")

                first_source = sources[0] if sources else None
                first_target = targets[0] if targets else None
                first_output = outputs[0] if outputs else None

                source_url = f"/api/projects/media/{proj_name}/source/{first_source}" if first_source else None
                target_url = f"/api/projects/media/{proj_name}/target/{first_target}" if first_target else None
                output_url = f"/api/projects/media/{proj_name}/output/{first_output}" if first_output else None

                ctime = os.path.getctime(proj_path)
                created_at = meta.get("created_at") or datetime.datetime.fromtimestamp(ctime).isoformat()

                projects.append({
                    "id": meta.get("id") or proj_name,
                    "name": proj_name,
                    "project_dir": proj_path,
                    "created_at": created_at,
                    "status": status,
                    "source_files": sources,
                    "target_files": targets,
                    "output_files": outputs,
                    "source_url": source_url,
                    "target_url": target_url,
                    "output_url": output_url,
                    "processors": meta.get("processors", ["face_swapper"])
                })

        projects.sort(key=lambda p: p["created_at"], reverse=True)
        return projects
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar projetos: {str(e)}")


@router.get("/projects/media/{project_name}/{folder}/{filename:path}")
def get_project_media(project_name: str, folder: str, filename: str):
    """
    Retorna com segurança os arquivos de mídia (source, target, output) pertencentes a um projeto na pasta Vídeos.
    """
    if folder not in ("source", "target", "output"):
        raise HTTPException(status_code=400, detail="Pasta de projeto inválida.")

    proj_dir = os.path.join(get_user_projects_dir(), project_name)
    file_path = validate_safe_path(os.path.join(proj_dir, folder, filename))

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Arquivo de mídia não encontrado no projeto.")

    return FileResponse(file_path)


@router.post("/api/projects/{project_name}/open-folder")
@router.post("/projects/{project_name}/open-folder")
def open_project_folder(project_name: str) -> Dict[str, Any]:
    """
    Abre o diretório do projeto no explorador de arquivos gráfico do sistema operacional (ex: Dolphin / Nautilus).
    """
    proj_dir = os.path.join(get_user_projects_dir(), project_name)
    validate_safe_path(proj_dir)

    if not os.path.exists(proj_dir):
        raise HTTPException(status_code=404, detail="Pasta do projeto não encontrada no disco.")

    try:
        import subprocess
        if sys.platform.startswith("linux"):
            subprocess.Popen(["xdg-open", proj_dir])
        elif sys.platform == "darwin":
            subprocess.Popen(["open", proj_dir])
        elif sys.platform == "win32":
            subprocess.Popen(["explorer", proj_dir])
        return {"status": "success", "message": f"Pasta do projeto '{project_name}' aberta no explorador de arquivos."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao abrir pasta do projeto: {str(e)}")


@router.delete("/projects/{project_name}")
def delete_project(project_name: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Exclui a pasta completa do projeto em ~/Vídeos/FaceFusion_Projects/ e remove jobs associados.
    """
    proj_dir = os.path.join(get_user_projects_dir(), project_name)
    validate_safe_path(proj_dir)

    if not os.path.exists(proj_dir):
        raise HTTPException(status_code=404, detail="Pasta do projeto não encontrada no disco.")

    try:
        import shutil
        shutil.rmtree(proj_dir)
        # Excluir jobs associados do banco
        jobs = db.query(JobModel).filter_by(project_name=project_name).all()
        for j in jobs:
            db.delete(j)
        db.commit()
        return {"status": "success", "message": f"Projeto '{project_name}' excluído com sucesso."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao excluir projeto: {str(e)}")


@router.get("/jobs")
def list_jobs(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    Retorna a lista de todas as tarefas (jobs) cadastradas no sistema, lidas a partir do banco de dados relacional.
    """
    try:
        jobs = db.query(JobModel).order_by(desc(JobModel.created_at)).all()
        jobs_list = []
        for job in jobs:
            source = ""
            if job.source_paths:
                try:
                    source_list = json.loads(job.source_paths)
                    if source_list:
                        source = f"/api/media/upload/{os.path.basename(source_list[0])}"
                except Exception:
                    pass

            target = ""
            if job.target_path:
                target = f"/api/media/upload/{os.path.basename(job.target_path)}"

            output = ""
            if job.output_path:
                if job.project_name:
                    output = f"/api/projects/media/{job.project_name}/output/{os.path.basename(job.output_path)}"
                else:
                    output = f"/api/media/output/{os.path.basename(job.output_path)}"

            jobs_list.append({
                "id": job.id,
                "project_name": job.project_name,
                "status": job.status,
                "progress": job.progress,
                "date_created": job.created_at,
                "date_updated": job.updated_at,
                "source": source,
                "target": target,
                "output": output,
                "error_message": job.error_message,
                "step": job.step
            })
        return jobs_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar jobs: {str(e)}")


@router.get("/jobs/stream")
async def stream_jobs():
    """
    Server-Sent Events (SSE) endpoint que envia atualizações da lista de jobs
    em tempo real para o cockpit, reduzindo overhead de polling HTTP contínuo.
    """
    import asyncio
    from fastapi.responses import StreamingResponse

    async def event_generator():
        last_hash = ""
        while True:
            try:
                db = SessionLocal()
                jobs = db.query(JobModel).order_by(desc(JobModel.created_at)).limit(50).all()
                data = [
                    {
                        "id": j.id,
                        "project_name": j.project_name,
                        "status": j.status,
                        "progress": j.progress,
                        "step": j.step,
                        "error_message": j.error_message,
                        "output_path": j.output_path,
                        "outputUrl": (
                            f"/api/projects/media/{j.project_name}/output/{os.path.basename(j.output_path)}"
                            if j.project_name and j.output_path and os.path.exists(j.output_path)
                            else (f"/api/media/output/{os.path.basename(j.output_path)}" if j.output_path and os.path.exists(j.output_path) else None)
                        ),
                        "created_at": j.created_at.isoformat() if j.created_at else None,
                        "updated_at": j.updated_at.isoformat() if j.updated_at else None
                    }
                    for j in jobs
                ]
                db.close()
                current_hash = f"{len(data)}:" + ";".join(f"{item['id']}-{item['status']}-{item['progress']}-{item['step']}" for item in data)
                if current_hash != last_hash:
                    last_hash = current_hash
                    yield f"data: {json.dumps(data)}\n\n"
            except Exception as e:
                yield f": heartbeat {str(e)}\n\n"
            await asyncio.sleep(1.0)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/jobs/{job_id}")
def get_job_status(job_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Retorna o status e os detalhes de uma tarefa específica.
    """
    job = db.query(JobModel).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    source = ""
    if job.source_paths:
        try:
            source_list = json.loads(job.source_paths)
            if source_list:
                source = f"/api/media/upload/{os.path.basename(source_list[0])}"
        except Exception:
            pass
            
    target = ""
    if job.target_path:
        target = f"/api/media/upload/{os.path.basename(job.target_path)}"
        
    output = ""
    if job.output_path and job.status == "completed":
        output = f"/api/media/output/{os.path.basename(job.output_path)}"

    return {
        "id": job.id,
        "status": job.status,
        "progress": job.progress,
        "date_created": job.created_at.isoformat(),
        "date_updated": job.updated_at.isoformat(),
        "source": source,
        "target": target,
        "output": output,
        "error_message": job.error_message,
        "step": job.step
    }


def apply_processor_args(step_args: Dict[str, Any], request: JobCreateRequest) -> None:
    if request.face_swapper_model is not None:
        step_args["face_swapper_model"] = request.face_swapper_model
    if request.face_swapper_pixel_boost is not None:
        step_args["face_swapper_pixel_boost"] = request.face_swapper_pixel_boost
    if request.face_swapper_weight is not None:
        step_args["face_swapper_weight"] = request.face_swapper_weight
    if request.face_mask_blur is not None:
        step_args["face_mask_blur"] = request.face_mask_blur
    if request.detection_threshold is not None:
        step_args["face_detector_score"] = request.detection_threshold
        step_args["face_landmarker_score"] = request.detection_threshold
    if request.trim_frame_start is not None:
        step_args["trim_frame_start"] = request.trim_frame_start
    if request.trim_frame_end is not None:
        step_args["trim_frame_end"] = request.trim_frame_end
    if request.face_enhancer_model is not None:
        step_args["face_enhancer_model"] = request.face_enhancer_model
    if request.face_enhancer_blend is not None:
        step_args["face_enhancer_blend"] = request.face_enhancer_blend
    if request.face_enhancer_weight is not None:
        step_args["face_enhancer_weight"] = request.face_enhancer_weight
    if request.frame_enhancer_model is not None:
        step_args["frame_enhancer_model"] = request.frame_enhancer_model
    if request.frame_enhancer_blend is not None:
        step_args["frame_enhancer_blend"] = request.frame_enhancer_blend
    if request.face_editor_model is not None:
        step_args["face_editor_model"] = request.face_editor_model
    if request.face_editor_eyebrow_direction is not None:
        step_args["face_editor_eyebrow_direction"] = request.face_editor_eyebrow_direction
    if request.face_editor_eye_gaze_horizontal is not None:
        step_args["face_editor_eye_gaze_horizontal"] = request.face_editor_eye_gaze_horizontal
    if request.face_editor_eye_gaze_vertical is not None:
        step_args["face_editor_eye_gaze_vertical"] = request.face_editor_eye_gaze_vertical
    if request.face_editor_eye_open_ratio is not None:
        step_args["face_editor_eye_open_ratio"] = request.face_editor_eye_open_ratio
    if request.face_editor_lip_open_ratio is not None:
        step_args["face_editor_lip_open_ratio"] = request.face_editor_lip_open_ratio
    if request.face_editor_mouth_smile is not None:
        step_args["face_editor_mouth_smile"] = request.face_editor_mouth_smile
    if request.face_editor_head_pitch is not None:
        step_args["face_editor_head_pitch"] = request.face_editor_head_pitch
    if request.face_editor_head_yaw is not None:
        step_args["face_editor_head_yaw"] = request.face_editor_head_yaw
    if request.face_editor_head_roll is not None:
        step_args["face_editor_head_roll"] = request.face_editor_head_roll
    if request.age_modifier_model is not None:
        step_args["age_modifier_model"] = request.age_modifier_model
    if request.age_modifier_direction is not None:
        step_args["age_modifier_direction"] = request.age_modifier_direction
    if request.lip_syncer_model is not None:
        step_args["lip_syncer_model"] = request.lip_syncer_model
    if request.lip_syncer_weight is not None:
        step_args["lip_syncer_weight"] = request.lip_syncer_weight
    if request.expression_restorer_model is not None:
        step_args["expression_restorer_model"] = request.expression_restorer_model
    if request.expression_restorer_factor is not None:
        step_args["expression_restorer_factor"] = request.expression_restorer_factor
    if request.deep_swapper_model is not None:
        step_args["deep_swapper_model"] = request.deep_swapper_model
    if request.deep_swapper_morph is not None:
        step_args["deep_swapper_morph"] = request.deep_swapper_morph
    if request.face_debugger_items is not None:
        step_args["face_debugger_items"] = request.face_debugger_items
    if request.frame_colorizer_model is not None:
        step_args["frame_colorizer_model"] = request.frame_colorizer_model
    if request.frame_colorizer_blend is not None:
        step_args["frame_colorizer_blend"] = request.frame_colorizer_blend
    if request.frame_colorizer_size is not None:
        step_args["frame_colorizer_size"] = request.frame_colorizer_size
    if request.background_remover_model is not None:
        step_args["background_remover_model"] = request.background_remover_model
    if request.background_remover_color is not None:
        step_args["background_remover_color"] = request.background_remover_color
    if request.output_audio_encoder is not None:
        step_args["output_audio_encoder"] = request.output_audio_encoder
    if request.output_audio_quality is not None:
        step_args["output_audio_quality"] = request.output_audio_quality
    if request.output_audio_volume is not None:
        step_args["output_audio_volume"] = request.output_audio_volume
    if request.output_video_encoder is not None:
        step_args["output_video_encoder"] = request.output_video_encoder
    if request.output_video_preset is not None:
        step_args["output_video_preset"] = request.output_video_preset


@router.post("/jobs")
def create_job(request: JobCreateRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Cria uma nova tarefa de Face Swap na fila persistente do banco de dados e no disco.
    Suporta mapeamento de múltiplos rostos ou fluxo padrão de face única/tudo.
    """
    try:
        jobs_path = state_manager.get_item("jobs_path") or get_default_path('data')
        uploads_dir = os.path.abspath(os.path.join(jobs_path, "uploads"))
        outputs_dir = os.path.join(jobs_path, "outputs")
        create_directory(outputs_dir)

        # Resolução automática de caminhos de mídia com validação segura
        resolved_source_paths = []
        for path in request.source_paths:
            if path.startswith("/api/media/upload/"):
                filename = os.path.basename(path)
                resolved_source_paths.append(validate_safe_path(os.path.join(uploads_dir, filename)))
            else:
                resolved_source_paths.append(validate_safe_path(path))
                
        resolved_target_path = request.target_path
        if request.target_path.startswith("/api/media/upload/"):
            filename = os.path.basename(request.target_path)
            resolved_target_path = validate_safe_path(os.path.join(uploads_dir, filename))
        else:
            resolved_target_path = validate_safe_path(request.target_path)

        from facefusion.filesystem import is_image, is_video
        
        # Validar existências e tipos de mídias de origem
        for p in resolved_source_paths:
            if not os.path.exists(p):
                raise HTTPException(status_code=400, detail=f"Arquivo de origem não encontrado no disco: {p}")
            if not (is_image(p) or is_video(p)):
                raise HTTPException(status_code=400, detail=f"Arquivo de origem com formato inválido ou corrompido: {p}")
                
        # Validar mídia de destino
        if not os.path.exists(resolved_target_path):
            raise HTTPException(status_code=400, detail=f"Arquivo de destino não encontrado no disco: {resolved_target_path}")
        if not (is_image(resolved_target_path) or is_video(resolved_target_path)):
            raise HTTPException(status_code=400, detail=f"Arquivo de destino com formato inválido ou corrompido: {resolved_target_path}")

        target_ext = os.path.splitext(resolved_target_path)[1] or ".mp4"
        job_id = f"job-{uuid.uuid4().hex[:8]}"

        # Estrutura de Projeto em ~/Vídeos/FaceFusion_Projects/<nome_do_projeto>/
        import re, shutil
        if request.project_name and request.project_name.strip():
            safe_project_name = re.sub(r'[^a-zA-Z0-9_\- ]+', '_', request.project_name.strip())
        else:
            safe_project_name = f"Projeto_{datetime.datetime.now().strftime('%Y-%m-%d_%H%M%S')}"

        projects_dir = get_user_projects_dir()
        proj_dir = os.path.join(projects_dir, safe_project_name)
        source_dir = os.path.join(proj_dir, "source")
        target_dir = os.path.join(proj_dir, "target")
        output_dir = os.path.join(proj_dir, "output")
        os.makedirs(source_dir, exist_ok=True)
        os.makedirs(target_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)

        # Copiar fontes para a subpasta source/ do projeto
        project_source_paths = []
        for p in resolved_source_paths:
            src_fname = os.path.basename(p)
            dest_src = os.path.join(source_dir, src_fname)
            if not os.path.exists(dest_src) or os.path.abspath(p) != os.path.abspath(dest_src):
                shutil.copy2(p, dest_src)
            project_source_paths.append(dest_src)

        # Copiar destino para a subpasta target/ do projeto
        tgt_fname = os.path.basename(resolved_target_path)
        dest_tgt = os.path.join(target_dir, tgt_fname)
        if not os.path.exists(dest_tgt) or os.path.abspath(resolved_target_path) != os.path.abspath(dest_tgt):
            shutil.copy2(resolved_target_path, dest_tgt)
        project_target_path = dest_tgt

        # Caminho final da renderização na pasta output/
        output_filename = f"resultado{target_ext}"
        output_path = os.path.abspath(os.path.join(output_dir, output_filename))

        # Criar project.json de metadados
        project_meta = {
            "id": job_id,
            "name": safe_project_name,
            "created_at": datetime.datetime.now().isoformat(),
            "status": "queued",
            "source_files": [os.path.basename(p) for p in project_source_paths],
            "target_file": tgt_fname,
            "output_file": output_filename,
            "output_path": output_path,
            "project_dir": proj_dir,
            "processors": request.processors,
            "output_format": request.output_format,
            "output_audio_encoder": request.output_audio_encoder,
            "output_audio_quality": request.output_audio_quality,
            "output_audio_volume": request.output_audio_volume,
            "output_video_encoder": request.output_video_encoder,
            "output_video_preset": request.output_video_preset
        }
        with open(os.path.join(proj_dir, "project.json"), "w", encoding="utf-8") as pf:
            json.dump(project_meta, pf, indent=2, ensure_ascii=False)

        # 1. Criar os arquivos de job no disco
        if not job_manager.create_job(job_id):
            raise HTTPException(status_code=500, detail="Falha ao criar arquivo de job.")

        if request.mappings:
            # Fluxo de Mapeamento de múltiplos rostos (passos sequenciais interligados)
            for idx, mapping in enumerate(request.mappings):
                resolved_mapping_source = mapping.source_path
                if mapping.source_path.startswith("/api/media/upload/"):
                    resolved_mapping_source = os.path.join(uploads_dir, os.path.basename(mapping.source_path))
                resolved_mapping_source = validate_safe_path(resolved_mapping_source)

                if not os.path.exists(resolved_mapping_source):
                    raise HTTPException(status_code=400, detail=f"Arquivo de origem mapeado não encontrado no disco: {resolved_mapping_source}")
                if not (is_image(resolved_mapping_source) or is_video(resolved_mapping_source)):
                    raise HTTPException(status_code=400, detail=f"Arquivo de origem mapeado com formato inválido ou corrompido: {resolved_mapping_source}")

                # Copiar também para source_dir se ainda não estiver
                map_fname = os.path.basename(resolved_mapping_source)
                map_dest_src = os.path.join(source_dir, map_fname)
                if not os.path.exists(map_dest_src) or os.path.abspath(resolved_mapping_source) != os.path.abspath(map_dest_src):
                    shutil.copy2(resolved_mapping_source, map_dest_src)

                step_args = collect_step_args()
                step_args["source_paths"] = [map_dest_src]
                
                # Interligar passos sequencialmente
                if idx == 0:
                    step_args["target_path"] = project_target_path
                else:
                    step_args["target_path"] = job_helper.get_step_output_path(job_id, idx - 1, output_path)

                step_args["output_path"] = output_path
                step_args["processors"] = request.processors
                step_args["face_selector_mode"] = "reference"
                step_args["reference_face_position"] = mapping.target_face_index
                step_args["reference_frame_number"] = mapping.reference_frame_number
                step_args["reference_target_path"] = project_target_path

                apply_processor_args(step_args, request)

                if not job_manager.add_step(job_id, step_args):
                    raise HTTPException(status_code=500, detail=f"Falha ao adicionar passo {idx} ao job.")
        else:
            # Fluxo padrão de face única/tudo
            step_args = collect_step_args()
            step_args["source_paths"] = project_source_paths
            step_args["target_path"] = project_target_path
            step_args["output_path"] = output_path
            step_args["processors"] = request.processors

            apply_processor_args(step_args, request)

            if not job_manager.add_step(job_id, step_args):
                raise HTTPException(status_code=500, detail="Falha ao adicionar step ao job.")

        if not job_manager.submit_job(job_id):
            raise HTTPException(status_code=500, detail="Falha ao enviar job para fila.")

        # 2. Registrar no banco de dados SQLite
        db_job = JobModel(
            id=job_id,
            status="queued",
            progress=0,
            project_name=safe_project_name,
            source_paths=json.dumps(project_source_paths),
            target_path=project_target_path,
            output_path=output_path,
            face_swapper_weight=request.face_swapper_weight,
            face_mask_blur=request.face_mask_blur,
            detection_threshold=request.detection_threshold,
            smoothing=request.smoothing,
            processors=json.dumps(request.processors)
        )
        db.add(db_job)
        db.commit()

        return {
            "job_id": job_id,
            "project_name": safe_project_name,
            "status": "queued",
            "output_path": output_path,
            "output_url": f"/api/projects/media/{safe_project_name}/output/{output_filename}"
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao criar job: {str(e)}")


@router.delete("/jobs/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Exclui uma tarefa do banco de dados, seus arquivos de job no disco e a mídia de saída se gerada.
    Impede a exclusão direta se a tarefa estiver em processamento ativo (necessário cancelar antes).
    """
    job = db.query(JobModel).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    if job.status == "processing":
        raise HTTPException(
            status_code=400,
            detail="Não é possível excluir uma tarefa em processamento ativo. Cancele-a antes de excluir."
        )

    try:
        # Excluir arquivos de job no disco
        job_manager.delete_job(job_id)
        
        # Excluir arquivos físicos de mídia se existirem
        if job.output_path and os.path.exists(job.output_path):
            try:
                os.remove(job.output_path)
            except Exception:
                pass
            
        # Excluir do banco
        db.delete(job)
        db.commit()
        
        return {"status": "success", "message": f"Job {job_id} excluído com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao excluir job: {str(e)}")


@router.post("/jobs/{job_id}/cancel")
def cancel_job(job_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Cancela uma tarefa em fila ou em processamento ativo com segurança.
    """
    job = db.query(JobModel).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
        
    if job.status in ("completed", "failed"):
        return {"status": "info", "message": f"A tarefa {job_id} já está finalizada ({job.status})."}
        
    if job.status == "queued":
        job.status = "failed"
        job.progress = 0
        job.error_message = "Cancelado pelo usuário na fila."
        db.commit()
        return {"status": "success", "message": f"Tarefa {job_id} cancelada na fila."}
        
    if job.status == "processing":
        from facefusion.api.worker import cancel_running_job
        cancel_running_job(job_id)
        job.status = "failed"
        job.progress = 0
        job.error_message = "Cancelado pelo usuário durante o processamento."
        db.commit()
        return {"status": "success", "message": f"Sinal de cancelamento enviado para a tarefa {job_id}."}

    return {"status": "unknown", "message": f"Status desconhecido da tarefa: {job.status}"}


@router.post("/media/cleanup")
def cleanup_temporary_media() -> Dict[str, Any]:
    """
    Exclui arquivos temporários de crops e previews efêmeros para evitar esgotamento de disco.
    """
    try:
        jobs_path = state_manager.get_item("jobs_path") or get_default_path('data')
        uploads_dir = os.path.abspath(os.path.join(jobs_path, "uploads"))
        crops_dir = os.path.join(uploads_dir, "crops")
        cleaned_count = 0
        if os.path.exists(crops_dir):
            for fname in os.listdir(crops_dir):
                fpath = os.path.join(crops_dir, fname)
                try:
                    if os.path.isfile(fpath):
                        os.remove(fpath)
                        cleaned_count += 1
                except Exception:
                    pass
        return {"status": "success", "message": f"{cleaned_count} arquivos de cache/crops removidos com sucesso."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na limpeza de mídia temporária: {str(e)}")


@router.get("/diagnostic/export")
def export_diagnostic(background_tasks: BackgroundTasks):
    """
    Gera um pacote ZIP contendo logs e configurações higienizados (sem PII ou segredos),
    e remove automaticamente o arquivo temporário após o download.
    """
    import tempfile
    import zipfile
    import platform
    try:
        from facefusion.filesystem import get_default_path
        from facefusion import state_manager
        
        # 1. Obter caminhos
        cache_dir = get_default_path('cache')
        log_file_path = os.path.join(cache_dir, 'facefusion.log')
        config_path = state_manager.get_item('config_path') or 'facefusion.ini'
        
        # 2. Criar arquivo zip temporário
        temp_zip = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
        temp_zip_name = temp_zip.name
        temp_zip.close()
        
        def sanitize_text(text: str) -> str:
            import re
            # Mascarar caminhos de usuário no Linux
            text = re.sub(r'/home/[a-zA-Z0-9_-]+', '/home/user', text)
            # Mascarar caminhos de usuário no macOS
            text = re.sub(r'/Users/[a-zA-Z0-9_-]+', '/Users/user', text)
            # Mascarar caminhos de usuário no Windows
            text = re.sub(r'[cC]:\\Users\\[a-zA-Z0-9_-]+', 'C:\\Users\\user', text)
            # Mascarar possíveis tokens/senhas
            text = re.sub(r'(?i)(token|password|secret|key)["\s:=]+[a-zA-Z0-9_=-]+', r'\1: [MASKED]', text)
            return text

        with zipfile.ZipFile(temp_zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Adicionar log higienizado se existir
            if os.path.exists(log_file_path):
                try:
                    with open(log_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        log_content = f.read()
                    sanitized_log = sanitize_text(log_content)
                    zipf.writestr('facefusion.log', sanitized_log)
                except Exception as ex:
                    zipf.writestr('log_error.txt', f"Erro ao ler log: {str(ex)}")
            else:
                zipf.writestr('facefusion.log', 'Nenhum log gerado ainda.')
                
            # Adicionar ini de configuração higienizado
            if os.path.exists(config_path):
                try:
                    with open(config_path, 'r', encoding='utf-8', errors='ignore') as f:
                        config_content = f.read()
                    sanitized_config = sanitize_text(config_content)
                    zipf.writestr('facefusion.ini', sanitized_config)
                except Exception as ex:
                    zipf.writestr('config_error.txt', f"Erro ao ler config: {str(ex)}")
                    
            # Adicionar dados do sistema/hardware
            system_info = {
                "os": platform.system(),
                "os_release": platform.release(),
                "os_version": platform.version(),
                "machine": platform.machine(),
                "python_version": platform.python_version(),
                "execution_providers": state_manager.get_item('execution_providers') or [],
                "video_memory_strategy": state_manager.get_item('video_memory_strategy') or 'balanced',
            }
            zipf.writestr('system_info.json', json.dumps(system_info, indent=4))
            
        # Agendar remoção do zip temporário após o streaming para o cliente
        background_tasks.add_task(os.remove, temp_zip_name)

        return FileResponse(
            temp_zip_name,
            background=background_tasks,
            media_type="application/zip",
            filename="facefusion_diagnostic.zip"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar diagnóstico: {str(e)}")


class PreviewRequest(BaseModel):
    source_paths: List[str]
    target_path: str
    processors: Optional[List[str]] = ["face_swapper"]
    frame_number: Optional[int] = 0
    timestamp: Optional[float] = None
    face_swapper_weight: Optional[float] = 0.5
    face_mask_blur: Optional[float] = 0.3
    detection_threshold: Optional[float] = 0.5
    face_swapper_model: Optional[str] = "hyperswap_1a_256"
    face_swapper_pixel_boost: Optional[str] = None
    face_enhancer_model: Optional[str] = "gfpgan_1.4"
    face_enhancer_blend: Optional[int] = 80
    face_enhancer_weight: Optional[float] = 1.0
    frame_enhancer_model: Optional[str] = "span_kendata_x4"
    frame_enhancer_blend: Optional[int] = 80
    # Additional processors options
    face_editor_model: Optional[str] = None
    face_editor_eyebrow_direction: Optional[float] = None
    face_editor_eye_gaze_horizontal: Optional[float] = None
    face_editor_eye_gaze_vertical: Optional[float] = None
    face_editor_eye_open_ratio: Optional[float] = None
    face_editor_lip_open_ratio: Optional[float] = None
    face_editor_mouth_smile: Optional[float] = None
    face_editor_head_pitch: Optional[float] = None
    face_editor_head_yaw: Optional[float] = None
    face_editor_head_roll: Optional[float] = None
    age_modifier_model: Optional[str] = None
    age_modifier_direction: Optional[int] = None
    lip_syncer_model: Optional[str] = None
    lip_syncer_weight: Optional[float] = None
    expression_restorer_model: Optional[str] = None
    expression_restorer_factor: Optional[float] = None
    deep_swapper_model: Optional[str] = None
    deep_swapper_morph: Optional[int] = None
    face_debugger_items: Optional[List[str]] = None
    frame_colorizer_model: Optional[str] = None
    frame_colorizer_blend: Optional[int] = None
    frame_colorizer_size: Optional[str] = None
    background_remover_model: Optional[str] = None
    background_remover_color: Optional[List[int]] = None


@router.post("/preview")
def generate_preview(request: PreviewRequest):
    """
    Gera um preview instantâneo aplicando os processadores selecionados em um único frame
    da mídia de destino, sem criar um job completo. Reutiliza a lógica nativa de preview
    do FaceFusion (mesma do Gradio UI).
    """
    import cv2
    import numpy
    import tempfile

    try:
        from facefusion.vision import read_static_image, read_static_images, read_video_frame, extract_vision_mask, merge_vision_mask, restrict_frame, unpack_resolution, detect_video_fps
        from facefusion.audio import create_empty_audio_frame
        from facefusion.processors.core import get_processors_modules
        from facefusion.filesystem import is_image, is_video, get_default_path
        from facefusion import state_manager as sm, logger as ff_logger

        # Resolver caminhos
        jobs_path = sm.get_item("jobs_path") or get_default_path('data')
        uploads_dir = os.path.abspath(os.path.join(jobs_path, "uploads"))

        resolved_source_paths = []
        for path in request.source_paths:
            if path.startswith("/api/media/upload/"):
                filename = os.path.basename(path)
                resolved_source_paths.append(validate_safe_path(os.path.join(uploads_dir, filename)))
            else:
                resolved_source_paths.append(validate_safe_path(path))

        resolved_target_path = request.target_path
        if request.target_path.startswith("/api/media/upload/"):
            filename = os.path.basename(request.target_path)
            resolved_target_path = validate_safe_path(os.path.join(uploads_dir, filename))
        else:
            resolved_target_path = validate_safe_path(request.target_path)

        # Validar que os arquivos existem e são válidos
        for sp in resolved_source_paths:
            if not os.path.exists(sp):
                raise HTTPException(status_code=400, detail=f"Arquivo source não encontrado: {sp}")
            if not (is_image(sp) or is_video(sp)):
                raise HTTPException(status_code=400, detail=f"Arquivo source com formato inválido ou corrompido: {sp}")
        if not os.path.exists(resolved_target_path):
            raise HTTPException(status_code=400, detail=f"Arquivo target não encontrado: {resolved_target_path}")
        if not (is_image(resolved_target_path) or is_video(resolved_target_path)):
            raise HTTPException(status_code=400, detail=f"Arquivo target com formato inválido ou corrompido: {resolved_target_path}")

        # Montar overrides thread-safe para o preview
        overrides = {
            'source_paths': resolved_source_paths,
            'target_path': resolved_target_path,
            'processors': request.processors or ["face_swapper"],
        }
        if request.face_swapper_model is not None:
            overrides['face_swapper_model'] = request.face_swapper_model
        if request.face_swapper_pixel_boost is not None:
            overrides['face_swapper_pixel_boost'] = request.face_swapper_pixel_boost
        if request.face_swapper_weight is not None:
            overrides['face_swapper_weight'] = request.face_swapper_weight
        if request.face_mask_blur is not None:
            overrides['face_mask_blur'] = request.face_mask_blur
        if request.detection_threshold is not None:
            overrides['face_detector_score'] = request.detection_threshold
            overrides['face_landmarker_score'] = request.detection_threshold
        if request.face_enhancer_model is not None:
            overrides['face_enhancer_model'] = request.face_enhancer_model
        if request.face_enhancer_blend is not None:
            overrides['face_enhancer_blend'] = request.face_enhancer_blend
        if request.face_enhancer_weight is not None:
            overrides['face_enhancer_weight'] = request.face_enhancer_weight
        if request.frame_enhancer_model is not None:
            overrides['frame_enhancer_model'] = request.frame_enhancer_model
        if request.frame_enhancer_blend is not None:
            overrides['frame_enhancer_blend'] = request.frame_enhancer_blend
        if request.face_editor_model is not None:
            overrides['face_editor_model'] = request.face_editor_model
        if request.face_editor_eyebrow_direction is not None:
            overrides['face_editor_eyebrow_direction'] = request.face_editor_eyebrow_direction
        if request.face_editor_eye_gaze_horizontal is not None:
            overrides['face_editor_eye_gaze_horizontal'] = request.face_editor_eye_gaze_horizontal
        if request.face_editor_eye_gaze_vertical is not None:
            overrides['face_editor_eye_gaze_vertical'] = request.face_editor_eye_gaze_vertical
        if request.face_editor_eye_open_ratio is not None:
            overrides['face_editor_eye_open_ratio'] = request.face_editor_eye_open_ratio
        if request.face_editor_lip_open_ratio is not None:
            overrides['face_editor_lip_open_ratio'] = request.face_editor_lip_open_ratio
        if request.face_editor_mouth_smile is not None:
            overrides['face_editor_mouth_smile'] = request.face_editor_mouth_smile
        if request.face_editor_head_pitch is not None:
            overrides['face_editor_head_pitch'] = request.face_editor_head_pitch
        if request.face_editor_head_yaw is not None:
            overrides['face_editor_head_yaw'] = request.face_editor_head_yaw
        if request.face_editor_head_roll is not None:
            overrides['face_editor_head_roll'] = request.face_editor_head_roll
        if request.age_modifier_model is not None:
            overrides['age_modifier_model'] = request.age_modifier_model
        if request.age_modifier_direction is not None:
            overrides['age_modifier_direction'] = request.age_modifier_direction
        if request.lip_syncer_model is not None:
            overrides['lip_syncer_model'] = request.lip_syncer_model
        if request.lip_syncer_weight is not None:
            overrides['lip_syncer_weight'] = request.lip_syncer_weight
        if request.expression_restorer_model is not None:
            overrides['expression_restorer_model'] = request.expression_restorer_model
        if request.expression_restorer_factor is not None:
            overrides['expression_restorer_factor'] = request.expression_restorer_factor
        if request.deep_swapper_model is not None:
            overrides['deep_swapper_model'] = request.deep_swapper_model
        if request.deep_swapper_morph is not None:
            overrides['deep_swapper_morph'] = request.deep_swapper_morph
        if request.face_debugger_items is not None:
            overrides['face_debugger_items'] = request.face_debugger_items
        if request.frame_colorizer_model is not None:
            overrides['frame_colorizer_model'] = request.frame_colorizer_model
        if request.frame_colorizer_blend is not None:
            overrides['frame_colorizer_blend'] = request.frame_colorizer_blend
        if request.frame_colorizer_size is not None:
            overrides['frame_colorizer_size'] = request.frame_colorizer_size
        if request.background_remover_model is not None:
            overrides['background_remover_model'] = request.background_remover_model
        if request.background_remover_color is not None:
            overrides['background_remover_color'] = request.background_remover_color

        with sm.temporary_state(overrides):
            processors = request.processors or []
            for processor_module in get_processors_modules(processors):
                if not processor_module.pre_check():
                    raise HTTPException(status_code=400, detail=f"Falha ao carregar ou baixar o modelo do processador: {processor_module.__name__}")

            # Ler frames de origem
            source_vision_frames = read_static_images(resolved_source_paths)
            source_audio_frame = create_empty_audio_frame()
            source_voice_frame = create_empty_audio_frame()

            # Ler frame de destino
            if is_image(resolved_target_path):
                reference_vision_frame = read_static_image(resolved_target_path)
                target_vision_frame = read_static_image(resolved_target_path, 'rgba')
            elif is_video(resolved_target_path):
                # Determinar o frame_number de acordo com timestamp ou frame_number fornecido
                if request.timestamp is not None:
                    fps = detect_video_fps(resolved_target_path) or 30.0
                    frame_number = int(request.timestamp * fps)
                else:
                    frame_number = request.frame_number or 0
                reference_vision_frame = read_video_frame(resolved_target_path, frame_number)
                target_vision_frame = read_video_frame(resolved_target_path, frame_number)
                if target_vision_frame is None:
                    raise HTTPException(status_code=400, detail="Não foi possível ler o frame do vídeo.")
                # Converter para RGBA se necessário
                if len(target_vision_frame.shape) == 3 and target_vision_frame.shape[2] == 3:
                    target_vision_frame = cv2.cvtColor(target_vision_frame, cv2.COLOR_BGR2BGRA)
            else:
                raise HTTPException(status_code=400, detail="Formato de target não suportado.")

            if target_vision_frame is None:
                raise HTTPException(status_code=400, detail="Frame de destino está vazio.")

            # Redimensionar temporariamente para otimizar velocidade de preview
            preview_resolution = '1024x1024'
            temp_vision_frame = restrict_frame(target_vision_frame, unpack_resolution(preview_resolution))
            temp_vision_frame_copy = temp_vision_frame.copy()
            temp_vision_mask = extract_vision_mask(temp_vision_frame_copy)

            for processor_module in get_processors_modules(processors):
                ff_logger.disable()
                if processor_module.pre_process('preview'):
                    ff_logger.enable()
                    temp_vision_frame_copy, temp_vision_mask = processor_module.process_frame(
                    {
                        'reference_vision_frame': reference_vision_frame,
                        'source_audio_frame': source_audio_frame,
                        'source_voice_frame': source_voice_frame,
                        'source_vision_frames': source_vision_frames,
                        'target_vision_frame': temp_vision_frame[:, :, :3],
                        'temp_vision_frame': temp_vision_frame_copy[:, :, :3],
                        'temp_vision_mask': temp_vision_mask
                    })
                ff_logger.enable()

            # Converter para imagem JPEG para retorno
            if len(temp_vision_frame_copy.shape) == 3 and temp_vision_frame_copy.shape[2] == 4:
                output_frame = cv2.cvtColor(temp_vision_frame_copy, cv2.COLOR_BGRA2BGR)
            elif len(temp_vision_frame_copy.shape) == 3 and temp_vision_frame_copy.shape[2] == 3:
                output_frame = temp_vision_frame_copy
            else:
                output_frame = temp_vision_frame_copy

            # Salvar como JPEG temporário
            outputs_dir = os.path.join(jobs_path, "outputs")
            os.makedirs(outputs_dir, exist_ok=True)
            preview_filename = f"preview_{uuid.uuid4().hex[:8]}.jpg"
            preview_path = os.path.join(outputs_dir, preview_filename)
            cv2.imwrite(preview_path, output_frame, [cv2.IMWRITE_JPEG_QUALITY, 92])

            return {
                "preview_url": f"/api/media/output/{preview_filename}",
                "status": "success"
            }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao gerar preview: {str(e)}")


class FaceAnalyzeRequest(BaseModel):
    file_path: str
    frame_number: Optional[int] = 0
    timestamp: Optional[float] = None


@router.post("/media/analyze-faces")
def analyze_faces(request: FaceAnalyzeRequest):
    """
    Detecta e classifica todos os rostos em um determinado frame/imagem.
    Retorna coordenadas, gênero, idade, raça e uma miniatura recortada.
    """
    try:
        from facefusion import state_manager as sm
        from facefusion.filesystem import is_image, is_video, get_default_path
        from facefusion.vision import read_static_image, read_video_frame, detect_video_fps
        from facefusion.face_selector import sort_and_filter_faces
        try:
            from facefusion.face_analyser import get_many_faces
        except ImportError:
            from facefusion.face_creator import get_many_faces
        from facefusion import face_detector, face_landmarker, face_recognizer, face_classifier
        import cv2
        import numpy as np

        # 1. Resolver caminhos
        jobs_path = sm.get_item("jobs_path") or get_default_path('data')
        uploads_dir = os.path.abspath(os.path.join(jobs_path, "uploads"))
        crops_dir = os.path.join(uploads_dir, "crops")
        os.makedirs(crops_dir, exist_ok=True)
        
        if request.file_path.startswith("/api/media/upload/"):
            filename = os.path.basename(request.file_path)
            resolved_path = validate_safe_path(os.path.join(uploads_dir, filename))
        else:
            resolved_path = validate_safe_path(request.file_path)
            
        if not os.path.exists(resolved_path):
            raise HTTPException(status_code=400, detail=f"Arquivo não encontrado: {resolved_path}")

        # 2. Executar pre_checks para garantir modelos baixados
        face_detector.pre_check()
        face_landmarker.pre_check()
        face_recognizer.pre_check()
        face_classifier.pre_check()

        # 3. Ler frame
        if is_image(resolved_path):
            frame = read_static_image(resolved_path)
        elif is_video(resolved_path):
            if request.timestamp is not None:
                fps = detect_video_fps(resolved_path) or 30.0
                frame_number = int(request.timestamp * fps)
            else:
                frame_number = request.frame_number or 0
            frame = read_video_frame(resolved_path, frame_number)
        else:
            raise HTTPException(status_code=400, detail="Formato de mídia não suportado para análise.")

        if frame is None:
            raise HTTPException(status_code=400, detail="Não foi possível ler o frame da mídia.")

        # 4. Detectar e classificar os rostos de forma thread-safe
        with sm.temporary_state({'face_selector_order': 'large-small'}):
            detected_faces = get_many_faces([frame])
            sorted_faces = sort_and_filter_faces(detected_faces)

        # 5. Salvar recortes e estruturar retorno
        results = []
        for idx, face in enumerate(sorted_faces):
            h, w = frame.shape[:2]
            # Coordenadas: left, top, right, bottom
            x_min = max(0, int(face.bounding_box[0]))
            y_min = max(0, int(face.bounding_box[1]))
            x_max = min(w, int(face.bounding_box[2]))
            y_max = min(h, int(face.bounding_box[3]))
            
            crop_url = None
            if x_max > x_min and y_max > y_min:
                crop = frame[y_min:y_max, x_min:x_max]
                crop_filename = f"crop_{uuid.uuid4().hex[:12]}.jpg"
                crop_path = os.path.join(crops_dir, crop_filename)
                
                # Converter de RGBA/BGR para BGR caso necessário antes de gravar
                if len(crop.shape) == 3 and crop.shape[2] == 4:
                    crop_bgr = cv2.cvtColor(crop, cv2.COLOR_BGRA2BGR)
                else:
                    crop_bgr = crop
                    
                cv2.imwrite(crop_path, crop_bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
                crop_url = f"/api/media/upload/crops/{crop_filename}"

            # Formatar a idade como string legível
            age_str = f"{face.age.start}-{face.age.stop - 1}" if hasattr(face.age, "start") else str(face.age)

            results.append({
                "index": idx,
                "bounding_box": [x_min, y_min, x_max, y_max],
                "gender": face.gender,
                "age": age_str,
                "race": face.race,
                "crop_url": crop_url
            })

        return {"faces": results}

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao analisar rostos: {str(e)}")
