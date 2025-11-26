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
import os, whisper, transformers, tempfile
from langchain_text_splitters import RecursiveCharacterTextSplitter, CharacterTextSplitter
from moviepy.audio.io.AudioFileClip import AudioFileClip
from moviepy.video.io.VideoFileClip import VideoFileClip
from docling.document_converter import DocumentConverter
from io import BytesIO
from pdfminer.high_level import extract_text
#from langchain_community.embeddings import HuggingFaceEmbeddings

#embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

os.environ["PATH"] += os.pathsep + os.path.abspath("./ffmpeg/bin")

conversor_pdf = DocumentConverter()
model = whisper.load_model("large")

def pdf2md_extractor(file_path:str):
    result = conversor_pdf.convert(file_path)
    text = result.document.export_to_markdown() or ""
    if not text.strip():
        return ["Sem texto reconhecido no documento"]
    return text

"""def pdf2md_extractormod(file_bytes: BytesIO, filename: str):
    file_bytes.seek(0)
    ext = filename.split(".")[-1]

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}")

    tmp.write(file_bytes.read())
    tmp.flush()
    tmp_path = tmp.name
    tmp.close()

    try:
        result = conversor_pdf.convert(tmp_path)
        text = result.document.export_to_markdown() or ""
    finally:
        os.remove(tmp_path) 

    if not text.strip():
        return ["Sem texto reconhecido no documento"]

    return text"""

def pdf2md_extractormod(file_bytes: BytesIO, filename: str):
    file_bytes.seek(0)
    text = extract_text(file_bytes)
    return text    

def mp2txt_extractor(file_path:str):
        
    if has_audio(file_path):
        result = model.transcribe(audio = file_path, language = "pt")
        return result["text"]

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

def chunk_data(text_data:str):
    splitter = RecursiveCharacterTextSplitter(
        separators=["\n\n", "\n", ".", "?", "!", " ", ""],
        chunk_size=2000,
        chunk_overlap=100
    )
    chunks = splitter.split_text(text_data)
    return [chunk.strip() for chunk in chunks if chunk.strip()]