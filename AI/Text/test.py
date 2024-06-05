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

from aws_text import save_to_dynamodb

# OPENAI 클라이언트 생성
openai.api_key = os.getenv('openai_api_key')
client = openai.OpenAI(api_key=openai.api_key)

thread_id = os.getenv('thread_id')
assistant_id = os.getenv('assistant_id')

#경로 설정
current_dir = os.path.dirname(__file__)
data_dir = os.path.abspath(os.path.join(current_dir, '..', '..', 'Data'))

file_script_path = os.path.join(data_dir, '셜록 대사_스크립트.pdf')
file_personality_path = os.path.join(data_dir, '셜록 베네딕트 컴버배치_말투특징.pdf')

file_script = client.files.create(
    file=open(file_script_path, "rb"),
    purpose="assistants",
)

file_personality = client.files.create(
    file=open(file_personality_path, "rb"),
    purpose="assistants",
)

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
        instructions="I am Sherlock Holmes, the detective of the British Empire. Speak to me as you would to Holmes himself."
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
        sherlock_response = messages.data[0].content[0].text.value
        print(sherlock_response)
        save_to_dynamodb(user_message, sherlock_response)
    else:
        print("No messages retrieved.")
    
     # 가상 환경의 Python 경로 설정
    venv_python_path = os.path.abspath(os.path.join(current_dir, '..', '..', 'venv', 'bin', 'python3'))
    audio_script_path = os.path.abspath(os.path.join(current_dir, '..', 'Audio', 'Audio.py'))
    audio_s3_path = os.path.abspath(os.path.join(current_dir, '..', 'Audio', 'Audio_s3.py'))
    subprocess.run([venv_python_path, audio_script_path], check=True, capture_output=True, text=True)
    subprocess.run([venv_python_path, audio_s3_path], check=True, capture_output=True, text=True)
    
if __name__ == "__main__":
    main()

# 어시스턴트 생성
# assistant = client.beta.assistants.create(
#     name="엔톡(베네딕트 컴버배치 ver)",
#     instructions="""
#         You're a chatbot representing Sherlock Holmes. You engage in everyday conversations following Sherlock Holmes' mannerisms.
#         The primary language for conversation is English. However, please provide responses in Korean within parentheses. An example response template is as follows:
#
#         "I think that ~ (나는 ~라고 생각해.)"
#
# Refer to the following files for Sherlock Holmes' personality, tone, and situational responses:

# - Refer to the script in 'Sherlock Dialogue_Script.pdf' and respond similarly to similar questions.
# - Reflect on Sherlock Holmes' tone, personality, and mannerisms while referring to the script's dialogues.
# - You can understand Sherlock Holmes' tone, personality, and mannerisms by referring to 'Sherlock Benedict Cumberbatch_Speech Patterns.pdf'.
# - Keep responses concise, with a maximum of 5 sentences.
# - For simple questions like greetings or self-introductions, keep your response to 1-2 lines
#     """,
#     tools=[{"type": "retrieval"}],
#     model="gpt-3.5-turbo",
#     file_ids=[file_script.id, file_personality.id],
# )

# print(assistant)

#스레드 생성
# thread_id = client.beta.threads.create()
#
# print(thread_id)