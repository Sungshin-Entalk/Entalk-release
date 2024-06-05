// 초기 내용 설정 함수
function setupInitialContent() {
    const messageArea = document.getElementById('messages');

    // 초기 이미지 추가
    const initialImage = document.getElementById('initialImage');
    if (!initialImage) { // 이미지가 없으면 새로 생성하여 추가
        const newInitialImage = document.createElement('img');
        newInitialImage.src = '../images/img_conv.png';
        newInitialImage.id = 'initialImage';
        newInitialImage.alt = 'Preparing new chat';
        newInitialImage.style.width = '40%';
        newInitialImage.style.height = 'auto';
        newInitialImage.style.marginTop = '10%';
        messageArea.appendChild(newInitialImage);
    }

    const buttonContainer = document.getElementById('buttonContainer');
    if (!buttonContainer) { // 버튼 컨테이너가 없으면 버튼을 추가
        const newButtonContainer = setupButtons();
        messageArea.appendChild(newButtonContainer);
    }
}

// 팝업 열기 함수
function openModal() {
    const modal = document.getElementById('newChatModal');
    modal.style.display = 'block';

    // 팝업 열 때 셜록에 대한 정보 업데이트
    updateModalContent(sherlockData);
}

// 버튼 설정 함수
function setupButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'buttonContainer';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-around';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.marginTop = '30px';

    // 버튼 배열로 생성
    const buttons = ['Tell me how to be a good detective.', 'What is the most memorable incident?', 'Why did you want to be a detective?', 'I am your true fan! I will always cheer for you!'];
    buttons.forEach((buttonText, index) => {
        const button = document.createElement('button');
        button.textContent = buttonText;
        const fontSize = 16; // 폰트 사이즈 설정
        button.style.padding = '30px 10px 30px 10px'; // padding: top right bottom left
        button.style.fontSize = `${fontSize}px`;
        button.style.backgroundColor = '#E9F0FF';
        button.style.color = '#333';
        button.style.border = 'none';
        button.style.margin = '0px 40px 0px 0px'; // margin: top right bottom left
        button.style.borderRadius = '8px';

        // 버튼의 높이를 설정하지 않고, 패딩으로 높이 조절
        buttonContainer.appendChild(button);
    });

    return buttonContainer;
}

// 팝업 내용 업데이트 함수
function updateModalContent(data) {
    const profilePic = document.querySelector('.profile-pic-big');
    const profileDetails = document.querySelector('.profile-details');

    // 프로필 이미지와 대체 텍스트 업데이트
    profilePic.src = data.imagePath;
    profilePic.alt = data.name;

    // 세부 정보 업데이트
    profileDetails.innerHTML = `
        <h3>Introduction</h3>
        <p>${data.introduction}</p>
        <h3>Actor</h3>
        <p>${data.actor}</p>
        <p>Caution: Characters do not represent actor </p>
    `;
}

// 팝업 창을 닫는 함수
function closeModal() {
    const modal = document.getElementById('newChatModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 예시 데이터
const sherlockData = {
    name: "Sherlock Holmes",
    imagePath: "../images/img_sherlockProfile.png",
    introduction: "Sherlock Holmes boasts unparalleled observational and deductive abilities, often appearing arrogant due to his confidence in his intellect. Prioritizing cases over social interactions, his significant relationship is with Watson, favoring unique solutions over traditional methods.",
    actor: "Benedict Cumberbatch"
};

// 문서가 로드되면 초기 내용 설정 함수 호출 및 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    setupInitialContent(); // 첫 화면에 초기 내용을 설정하는 함수 호출
    document.getElementById('createNewRoom').addEventListener('click', function() {
        openModal(); // Nexchat 버튼 클릭 시 팝업 열기
    });
    document.getElementById('runPython').onclick = sendMessage; // 'Send' 버튼에 이벤트 연결
    
    // X 버튼 클릭 시 팝업 창 닫기
    const closeButton = document.querySelector('.close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
});