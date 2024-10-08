import os
from dynamodb_handler_spiderman import get_text_from_dynamodb
from tts_handler_spidermain import generate_audio

def main():
    table_name = 'entalk-spiderman'

    # DynamoDB에서 텍스트 가져오기
    text_content = get_text_from_dynamodb(table_name)

    # 오디오 파일 경로 설정
    current_dir = os.path.dirname(__file__)
    speaker_wav_path = os.path.abspath(os.path.join(current_dir, 'spiderman_8sec.mp3'))
    output_path = os.path.abspath(os.path.join(current_dir, '../../../Data/spiderman.wav'))

    # 오디오 파일 생성
    generate_audio(text_content, speaker_wav_path, output_path)

if __name__ == "__main__":
    main()
