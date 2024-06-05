import boto3
from TTS.api import TTS
import os
from dotenv import load_dotenv

# .env 파일의 환경 변수를 로드합니다.
load_dotenv()

def main():
    # AWS 자격 증명 및 리전 설정
    aws_access_key_id = os.getenv('aws_access_key_id')
    aws_secret_access_key = os.getenv('aws_secret_access_key')
    region_name = os.getenv('region_name')
    
    # 기존 클라이언트 재사용
    dynamodb = boto3.client('dynamodb', 
                            aws_access_key_id=aws_access_key_id,
                            aws_secret_access_key=aws_secret_access_key,
                            region_name=region_name)

    # 테이블 이름 설정
    table_name = 'entalk-aws'

    try:
        # 테이블에서 모든 항목 스캔
        response = dynamodb.scan(TableName=table_name)
        items = response['Items']

        # entalkproject 값이 최대인 항목 찾기
        max_project = max(items, key=lambda x: int(x['entalkproject']['N']))

        # 최대 entalkproject 값과 id가 2인 항목 필터링
        filtered_items = [item for item in items if item['entalkproject']['N'] == max_project['entalkproject']['N'] and item['id']['S'] == '2']

        if filtered_items:
            # 해당 조건을 만족하는 첫 번째 항목의 text 출력
            text_content = filtered_items[0]['text']['S']
        else:
            text_content = "조건에 맞는 항목이 없습니다."

    except Exception as e:
        text_content = "데이터 가져오기 오류: " + str(e)

    # 오디오 파일의 절대 경로 설정
    current_dir = os.path.dirname(__file__)
    speaker_wav_path = os.path.abspath(os.path.join(current_dir, 'benedict_8sec.mp3'))
    output_path = os.path.abspath(os.path.join(current_dir, '../../Data/output.wav'))


    # audio
    tts = TTS("tts_models/multilingual/multi-dataset/your_tts", gpu=False)
    

    try:
        tts.tts_to_file(text=text_content,
                        file_path=output_path,
                        speaker_wav=[speaker_wav_path],
                        language="en",
                        split_sentences=True
                        )
        
    except Exception as e:
        print("오디오 파일 생성 오류:", e)

if __name__ == "__main__":
    main()
