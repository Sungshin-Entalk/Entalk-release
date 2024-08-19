import os
from TTS.api import TTS

def generate_audio(text_content, speaker_wav_path, output_path):
    tts = TTS("tts_models/multilingual/multi-dataset/your_tts", gpu=False)
    
    try:
        tts.tts_to_file(text=text_content,
                        file_path=output_path,
                        speaker_wav=[speaker_wav_path],
                        language="en",
                        split_sentences=True)
        print(f"Audio generated successfully at {output_path}")
    except Exception as e:
        print("오디오 파일 생성 오류:", e)
