import sys
import os
import openai
import time
import subprocess
from dotenv import load_dotenv

# .env 파일의 환경 변수를 로드합니다.
load_dotenv()

# AWS 모듈을 import (상대 경로 설정)
current_dir = os.path.dirname(__file__)
aws_dir = os.path.abspath(os.path.join(current_dir, '..', '..', 'AWS'))
sys.path.append(aws_dir)

from aws_text_hermione import save_to_dynamodb

# OPENAI 클라이언트 생성
openai.api_key = os.getenv('openai_api_key')
client = openai.OpenAI(api_key=openai.api_key)

thread_id = os.getenv('thread_id_hermione')
assistant_id = os.getenv('assistant_id_hermione')

#경로 설정
current_dir = os.path.dirname(__file__)
data_dir = os.path.abspath(os.path.join(current_dir, '..', '..', 'Data'))

file_script_path = os.path.join(data_dir, '헤르미온느 대사_스크립트.pdf')
file_personality_path = os.path.join(data_dir, '헤르미온느_말투특징.pdf')

def get_user_input():
    return sys.argv[1] if len(sys.argv) > 1 else "기본 메시지"

def create_message(client, thread_id, user_input):
    message = client.beta.threads.messages.create(
        thread_id=thread_id, 
        role="user", 
        content=user_input
    )
    return message

def run_conversation(client, thread_id, assistant_id):
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id,
        instructions = "I am Hermione Granger, the brightest witch of my age from Hogwarts School of Witchcraft and Wizardry. Speak to me as you would to Hermione herself."
    )
    
    while run.status != "completed":
        time.sleep(0.5)
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
    
    return run

def get_messages(client, thread_id):
    messages = client.beta.threads.messages.list(thread_id=thread_id)
    return messages

def handle_active_runs(client, thread_id):
    runs = client.beta.threads.runs.list(thread_id=thread_id)
    for run in runs.data:
        if run.status == "running":
            client.beta.threads.runs.update(thread_id=thread_id, run_id=run.id, status="completed")

def main():
    user_input = get_user_input()
    handle_active_runs(client, thread_id)
    create_message(client, thread_id, user_input)
    run_conversation(client, thread_id, assistant_id)
    messages = get_messages(client, thread_id)
    
    if messages.data:
        user_message = user_input
        hermione_response = messages.data[0].content[0].text.value
        print(hermione_response)
        save_to_dynamodb(user_message, hermione_response)
    else:
        print("No messages retrieved.")
    
     # 가상 환경의 Python 경로 설정, python 실행코드
    venv_python_path = os.path.abspath(os.path.join(current_dir, '..', '..', 'venv', 'bin', 'python3'))
    audio_script_path = os.path.abspath(os.path.join(current_dir, '..', 'Audio', 'hermione', 'Audio_hermione.py'))
    audio_s3_path = os.path.abspath(os.path.join(current_dir, '..', 'Audio', 'hermione', 'Audio_s3_hermione.py'))
    subprocess.run([venv_python_path, audio_script_path], check=True, capture_output=True, text=True)
    subprocess.run([venv_python_path, audio_s3_path], check=True, capture_output=True, text=True)
    
if __name__ == "__main__":
    main()

# 어시스턴트 생성
# 어시스턴트 id: asst_wotH0WRdupyGd35n5ChYcgAi
# assistant = client.beta.assistants.create(
#     name="엔톡_new(베네딕트 컴버배치 ver)",
#     instructions="""
#       The assistant must strictly adhere to the following guidelines during the conversation:

#      - Start the conversation in a curt manner as Sherlock Holmes would.
#        Incorrect example: 'Hello! How can I assist you today?'
#        Correct examples: 'Ah, you again. What trivial matter do you bring to my attention this time?', 'What is it now? I hope it's something that actually requires my intellect.', 'Oh, it's you. Make it quick, I'm in the middle of something important.', 'You have my attention for the next five minutes. Use it wisely.' etc.

#      - Refer to '셜록_말투특징_뉴(영어).pdf' for Sherlock Holmes' personality and mannerisms.

#      - Refer to '셜록 대사_스크립트_뉴(전체).pdf' for expected responses from Sherlock Holmes.

#      - Always respond in English.
#      - And also translate it into Korean. 
#         example: I am a student. (나는 학생이야.)
# #     """,
#     tools=[{"type": "file_search"}],
#     model="gpt-3.5-turbo",
#     #file_ids=[file_script.id, file_personality.id],
# )

# print(assistant)

# 어시스턴트 업데이트 
# assistant = client.beta.assistants.update(
#   assistant_id=assistant_id,
#   tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}},
# )

#스레드 생성
# 스레드 id: thread_BSiSokZBPVLrOPr9KlgRlgv2
# thread_id = client.beta.threads.create()

# print(thread_id)

