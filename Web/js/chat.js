$(document).ready(function() {
    // 문서가 로드될 때 초기 내용 설정 함수 호출
    setupInitialContent();

    $("#runPython").click(function() {
        sendMessage();
    });

    // Enter 키 이벤트 추가
    $("#userInput").keydown(function(event) {
        if (event.keyCode === 13) {
            sendMessage();
        }
    });

    // sendMessage 함수 내의 코드 수정
    function sendMessage() {
        var userMessage = $("#userInput").val().trim();
        if (userMessage !== '') {
            // 기본 메인 화면을 숨깁니다.
            hideInitialContent();
            $("#chatroom").css("display", "flex");

            // 기존 코드를 이어서 진행합니다.
            var timestamp = getCurrentTimestamp();
            var userHtml = '<div class="message-container">' +
                            '<div class="user-message">' +
                            '<p>' + userMessage + '</p>' +
                            '<span class="timestamp">' + timestamp + '</span>' +
                            '</div>' +
                            '</div>';
            $("#messages").append(userHtml);

            $.ajax({
                url: '/submit',
                type: 'post',
                dataType: 'json',
                contentType: 'application/json',
                success: function(data) {
                    var sherlockResponse = data.reply;
                    var index = 0;
                    var timestamp = getCurrentTimestamp();
                    var sherlockHtml = '<div class="message-container">' +
                                       '<div class="user-info">' +
                                       '<img src="../images/img_sherlock.png" alt="Sherlock" class="profile-pic">' +
                                       '<span class="username">Sherlock Holmes</span>' +
                                       '</div>' +
                                       '<div class="sherlock-message">' +
                                       '<p></p>' +
                                       '<span class="timestamp">' + timestamp + '</span>' +
                                       '</div>' +
                                       '</div>';
                    $("#messages").append(sherlockHtml);
                    var $sherlockMessage = $(".sherlock-message:last p");
                    var interval = setInterval(function() {
                        $sherlockMessage.text(sherlockResponse.substring(0, index));
                        scrollToBottom();
                        index++;
                        if (index > sherlockResponse.length) {
                            clearInterval(interval);
                            // 답변이 끝나면 이미지 버튼 추가
                            $(".sherlock-message:last").append('<button class="sherlock-message-button" onclick="sherlockButtonAction()"><img src="../images/img_sound.png" alt="Sound" style="width: 40px; height: 20px;  background-color: transparent; border: none;"></button>');
                        }
                    }, 50); // Adjust the interval for the speed of text display
                },
                data: JSON.stringify({ message: userMessage })
            });

            $("#userInput").val("");
        }
    }

    function hideInitialContent() {
        // 초기 콘텐츠 숨기기
        var initialImage = document.getElementById('initialImage');
        if (initialImage) {
            initialImage.style.display = 'none';
        }

        var buttonContainer = document.getElementById('buttonContainer');
        if (buttonContainer) {
            buttonContainer.style.display = 'none';
        }
    }

    function scrollToBottom() {
        var chatWindow = $("#messages");
        chatWindow.scrollTop(chatWindow[0].scrollHeight);
    }

    function getCurrentTimestamp() {
        let now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' +
               now.getMinutes().toString().padStart(2, '0') + ':' +
               now.getSeconds().toString().padStart(2, '0');
    }
    
    // 셜록 메시지 버튼 액션 함수
    window.sherlockButtonAction = function() {
        fetch('/latest-audio')
            .then(response => response.json())
            .then(data => {
                console.log('Audio URL:', data.url); // URL을 콘솔에 출력하여 확인
                let audio = new Audio(data.url); // 오디오 객체 생성
                audio.play() // 오디오 재생
                    .then(() => console.log("Audio is playing")) // 재생이 성공적으로 시작됐을 때
                    .catch(error => console.error('Error playing the audio:', error)); // 재생 오류 처리
            })
            .catch(error => console.error('Error fetching audio:', error)); // 오디오 URL 가져오기 오류 처리
    };
});