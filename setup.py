from setuptools import setup, find_packages

setup(
    name='entalk',
    version='0.1',
    packages=find_packages(),
    install_requires=[
        'boto3',
        'TTS',
        'python-dotenv',
    ],
    entry_points={
        'console_scripts': [
            'your_package=your_package.main:main',
        ],
    },
)
