import boto3
import os
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
from datetime import datetime
from dotenv import load_dotenv

# .env 파일의 환경 변수를 로드합니다.
load_dotenv()

# 환경 변수에서 액세스 키를 가져옵니다.
aws_access_key_id = os.getenv('aws_access_key_id')
aws_secret_access_key = os.getenv('aws_secret_access_key')
bucket_name = os.getenv('bucket_name')

# 현재 파일의 위치
current_dir = os.path.dirname(__file__)

# AWS 자격 증명 및 S3 버킷 설정
file_path = os.path.abspath(os.path.join(current_dir, '..', '..', 'Data', 'output.wav'))
s3_key = 'output.wav'  # S3에서 파일을 저장할 경로

# 현재 시각을 기반으로 동적 파일 이름 생성
current_time = datetime.now().strftime('%Y%m%d-%H%M%S')
s3_key = f'audio/output-{current_time}.wav'  # S3에서 파일을 저장할 경로 및 이름

def upload_to_s3(file_path, bucket_name, s3_key):
    # S3 클라이언트 생성
    s3 = boto3.client(
        's3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key
    )
    
    try:
        # 파일 업로드
        s3.upload_file(file_path, bucket_name, s3_key)
        print(f'File {file_path} uploaded to {bucket_name}/{s3_key}')
    except FileNotFoundError:
        print(f'The file {file_path} was not found')
    except NoCredentialsError:
        print('Credentials not available')
    except PartialCredentialsError:
        print('Incomplete credentials provided')

# 파일 업로드 함수 호출
upload_to_s3(file_path, bucket_name, s3_key)
