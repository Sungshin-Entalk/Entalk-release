$(document).ready(function() {
    let selectedCharacter = localStorage.getItem('selectedCharacter');
            console.log("Loaded character from storage:", selectedCharacter); // 로드된 캐릭터 확인용

            // 페이지에 따라 특정 로직을 처리
            if (selectedCharacter === 'sherlock') {
                $('#character-header').text('Welcome, Sherlock Holmes!');
                // 셜록과 관련된 로직 추가
            } else if (selectedCharacter === 'hermione') {
                $('#character-header').text('Welcome, Hermione Granger!');
                // 헤르미온느와 관련된 로직 추가
            } else if (selectedCharacter === 'spiderman') {
                $('#character-header').text('Welcome, Spiderman!');
                // 스파이더맨과 관련된 로직 추가
            } else {
                $('#character-header').text('No character selected.');
            }

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
        if (userMessage !== '' && selectedCharacter !== '') { // 메시지와 캐릭터가 선택된 경우에만 실행
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
                data: JSON.stringify({
                    message: userMessage,     // 전송되는 데이터가 올바른지 확인
                    character: selectedCharacter // character 필드가 누락되거나 잘못된 경우 오류 발생 가능
                }),
                success: function(data) {
                    var characterResponse = data.reply;
                    var index = 0;
                    var timestamp = getCurrentTimestamp();

                    // 캐릭터에 따라 다르게 처리
                    var characterHtml;
                    if (selectedCharacter === 'sherlock') {
                        characterHtml = '<div class="message-container">' +
                                        '<div class="user-info">' +
                                        '<img src="../images/img_sherlock.png" alt="Sherlock" class="profile-pic">' +
                                        '<span class="username">Sherlock Holmes</span>' +
                                        '</div>' +
                                        '<div class="sherlock-message">' +
                                        '<p></p>' +
                                        '<span class="timestamp">' + timestamp + '</span>' +
                                        '</div>' +
                                        '</div>';
                    } else if (selectedCharacter === 'spiderman') {
                        characterHtml = '<div class="message-container">' +
                                        '<div class="user-info">' +
                                        '<img src="../images/img_spiderman.png" alt="Spiderman" class="profile-pic">' +
                                        '<span class="username">Spiderman</span>' +
                                        '</div>' +
                                        '<div class="spiderman-message">' +
                                        '<p></p>' +
                                        '<span class="timestamp">' + timestamp + '</span>' +
                                        '</div>' +
                                        '</div>';
                    }
                    else if (selectedCharacter === 'hermione') {
                        characterHtml = '<div class="message-container">' +
                                        '<div class="user-info">' +
                                        '<img src="../images/img_hermione.png" alt="hermione" class="profile-pic">' +
                                        '<span class="username">hermione</span>' +
                                        '</div>' +
                                        '<div class="hermione-message">' +
                                        '<p></p>' +
                                        '<span class="timestamp">' + timestamp + '</span>' +
                                        '</div>' +
                                        '</div>';
                    }
                    $("#messages").append(characterHtml);
                    var $characterMessage = $(".message-container:last p");
                    var interval = setInterval(function() {
                        $characterMessage.text(characterResponse.substring(0, index));
                        scrollToBottom();
                        index++;
                        if (index > characterResponse.length) {
                            clearInterval(interval);
                            $(".message-container:last").append('<button class="character-message-button" onclick="characterButtonAction()"><img src="../images/img_sound.png" alt="Sound" style="width: 40px; height: 20px; background-color: transparent; border: none;"></button>');
                        }
                    }, 50);
                },
                data: JSON.stringify({
                    message: userMessage,
                    character: selectedCharacter // 선택된 캐릭터 정보를 함께 전송
                })
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
