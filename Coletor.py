# Extrair dados de um input
# 3 modulos (ideia):
#   - texto -> pode ser inserido no formato como está
#   - audio/video -> precisamos apenas do áudio nesse estado, então podemos pegar o conteúdo de áudio
#   - arquivo pdf/slide -> precisamos do conteúdo desse material. 
#                          agora, temos dois problemas:
#                               1: tamanho do arquivo -> "e se eu quiser colocar Dom Casmurro **INTEIRO**, pra estudar para minha prova de paradidático"
#                               2: e os materiais visuais dentro de um slide
#
# Precisamos de Chunking dos dados para: arquivos muito longos ou muitos arquivos
import os, whisper, transformers, ffmpeg
from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.video.io.VideoFileClip import VideoFileClip
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import OcrOptions, RapidOcrOptions
from langchain_huggingface import HuggingFaceEmbeddings

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
)

#os.environ["PATH"] += os.pathsep + os.path.abspath("./ffmpeg/bin")

ocr_opts = OcrOptions(
    do_ocr=True,
    ocr_engine="rapidocr",
    lang=["eng", "por"],
)

pdf_config = PdfFormatOption(
    ocr_options=ocr_opts,
    do_table_structure=True,
    preserve_layout=False,
)

conversor_pdf = DocumentConverter(format_options={
    InputFormat.PDF: pdf_config
})
model = whisper.load_model("large")

def pdf2md_extractor(file_path:str):
    result = conversor_pdf.convert(file_path)
    text = result.document.export_to_markdown() or ""
    if not text.strip():
        return ["Sem texto reconhecido no documento"]
    return text

def mp2txt_extractor(file_path:str):
        
    if has_audio(file_path):
        result = model.transcribe(audio = file_path, language = "pt")
        return result["text"]
    return None

def has_audio(file_path:str):

    if file_path.lower().endswith((".mp3", ".ogg")):
        try:
            clip = AudioFileClip(file_path)
        except FileExistsError:
            return False
        
    elif file_path.lower().endswith(".mp4"):
        try:
            clip = VideoFileClip(file_path)
        except FileExistsError:
            return False
        
    if clip is not None:
        return True

def gerar_embeddings(chunk):
    return embedding_model.embed_query(chunk)