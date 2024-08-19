import os
from dotenv import load_dotenv
from dynamodb_handler import get_dynamodb_client, get_text_from_dynamodb
from tts_handler import generate_audio

load_dotenv()
print(f"AWS Access Key: {os.getenv('aws_access_key_id')}")

def main():
    dynamodb = get_dynamodb_client()
    table_name = 'entalk-aws'

    text_content = get_text_from_dynamodb(dynamodb, table_name)

    current_dir = os.path.dirname(__file__)
    speaker_wav_path = os.path.abspath(os.path.join(current_dir, 'benedict_8sec.mp3'))
    output_path = os.path.abspath(os.path.join(current_dir, '../../../Data/output.wav'))

    generate_audio(text_content, speaker_wav_path, output_path)

    print(f"Current directory: {os.getcwd()}")

if __name__ == "__main__":
    main()

