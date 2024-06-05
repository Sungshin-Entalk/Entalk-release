import boto3
from boto3.dynamodb.conditions import Attr
from dotenv import load_dotenv
import os

# .env 파일의 환경 변수를 로드합니다.
load_dotenv()

Aws_access_key_id = os.getenv('aws_access_key_id')
Aws_secret_access_key = os.getenv('aws_secret_access_key')
Region_name = os.getenv('region_name')


def save_to_dynamodb(user_message, sherlock_response):
    dynamodb = boto3.resource('dynamodb', region_name = Region_name,
                              aws_access_key_id = Aws_access_key_id,
                              aws_secret_access_key = Aws_secret_access_key)
    table = dynamodb.Table('entalk-aws')
    response = table.scan(Select='COUNT')
    last_key = response['Count'] + 1

    # 사용자 메시지 저장 (id = 1)
    table.put_item(
        Item={
            'entalkproject': last_key,  # 숫자 유형으로 저장
            'id': '1',                  # 사용자의 id
            'text': user_message        # 사용자 메시지 내용
        }
    )

    # 셜록 홈즈의 응답 저장 (id = 2)
    table.put_item(
        Item={
            'entalkproject': last_key + 1,  # 다음 메시지 ID
            'id': '2',                      # 셜록 홈즈의 id
            'text': sherlock_response       # 셜록 홈즈의 메시지 내용
        }
    )