/* 
    Author: Cleto Barbosa
    Designation: Lead Software Engineer
    Description: AI-powered chat interface for AI tools
*/

$(document).ready(function() {
    const API_URLS = {
        'cortex':'http://0.0.0.0:5000/cortex',
        'openai':'http://0.0.0.0:6000/openai'
    };
    let SELECTED_MODEL_URL = '';
    const chatMessages = document.getElementById('chatMessages');
    const body = document.querySelector('body');
 
    // Function to check if Speech.js is loaded    
    function checkScriptLoaded(scriptName) {
        const resources = performance.getEntriesByType("resource");
        const scriptLoaded = resources.some(r => r.name.includes(scriptName));

        if(scriptLoaded) {
            console.log("Speech.js is loaded");
        } else {
            console.log("Speech.js is NOT loaded");
            console.log("Please contact the author of this script.");
            console.log("Author: Cleto Barbosa");
            $('#alert-message').find('.toast-body').html("Speech.js is NOT loaded.</br></br>Please contact the author of this script.</br>Author: Cleto Barbosa");
            $('#alert-message').toast('show');
        }
    }
    
    // Function to add chat message
    function addMessage(sender, text, type='text') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        if(sender === 'ai' && type === 'text') {
            let letters = text.split('');
            let j = 0;

            let timer = setInterval(function() {
                if(j < letters.length) {
                    messageElement.innerHTML += letters[j];
                    j++;
                } else {
                    // body.classList.remove('loading');
                    clearInterval(timer);
                }
            }, 10);
        }

        if(sender === 'ai' && type === 'table') {
            messageElement.innerHTML = text;
        }

        if(sender === 'ai' && type === 'suggestions') {
            messageElement.innerHTML = text;
        }

        if(sender === 'user' && type === 'text') {
            messageElement.innerHTML = text;
        }

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to add chat spinner
    function addSpinner() {
        const spinnerElement = document.createElement('div');
        spinnerElement.classList.add('spinner-grow', 'text-light', 'spinner-grow-sm', 'spinner');
        chatMessages.appendChild(spinnerElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to remove chat spinner
    function removeSpinners() {
        const spinners = document.querySelectorAll('.spinner');
        spinners.forEach(spinner => {
            spinner.remove();
        });
    }

    function clickEventSuggestions() {
        // Suggestions click event
        $('.ai-message-suggestion').on('click', function() {
            let message = $(this).text();

            $('.final').val(message);
            $('#button-submit').click();
        });
    }

    // Execution starts here
    // Check for speeach.js script loaded status
    checkScriptLoaded('speech.js');

    $('.dropdown-menu .dropdown-item').on('click', function() {
        $('.dropdown-toggle').text($(this).text());
        SELECTED_MODEL_URL = API_URLS[$(this).data('key')];
    });

    // Submit on enter key press
    $('.final').on('keypress', function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            setTimeout(function() {
                $('#button-submit').click();
            }, 500);
        }
    });

    // Submit on click
    $('#button-submit').on('click', function() {
        var message = $('.final').val().trim();

        // body.classList.add('loading');

        if(!SELECTED_MODEL_URL) {
            $('#alert-message').find('.toast-body').html("Please select a model to proceed.");
            $('#alert-message').toast('show');
            return;
        }

        if (message && $('.mic-icon').hasClass('off')) {
            addMessage('user', message);
            addSpinner();
            $('#chatInput').val('');
            
            fetch(SELECTED_MODEL_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: message
                })
            }).then(response => 
                response.json()
            ).then(data => {
                // console.log(data);

                if(Object.keys(data).length && data.suggestions.length) {
                    console.log('suggestions available');

                    let suggestions = '';

                    data.suggestions.map(suggestion => {
                        suggestions +=  `<div class="message-suggestion ai-message-suggestion">${suggestion}</div>`;
                    });
                    
                    addMessage('ai', suggestions, 'suggestions');
                    clickEventSuggestions();
                } else {
                    console.log('suggestions not available')

                    if(Object.keys(data).length && data.table.length) {
                        let table = '<table class="table table-striped table-sm table-bordered">';
                        let tableHeaders = tableRows = '';

                        data.table.map((row, index) => {
                            if(index === 0) {
                                let headers = Object.keys(row);
                                headers.map(header => {
                                    tableHeaders += `<th scope="col">${header.split('_').join(' ')}</th>`;
                                });
                            }
                            
                            let rows = Object.values(row);
                            tableRows += '<tr>';

                            rows.map(data => {
                                tableRows += `<td>${data}</td>`;
                            });

                            tableRows += '</tr>';
                        });

                        table +='<thead class="thead-dark">';
                        table +='<tr>';
                        table += tableHeaders;
                        table +='</tr>';
                        table +='</thead>';
                        table +='<tbody>';
                        table += tableRows;
                        table +='</tbody>';
                        table +='</table>';
    
                        addMessage('ai', table, 'table');
                    }
                }

                if(Object.keys(data).length && data.text) {
                    removeSpinners()
                    addMessage('ai', data.text);
                }
                
                $('.final').val('');
            }).catch(error => {
                console.log(error);
                // body.classList.remove('loading');

                if(error) {
                    removeSpinners()
                    chatMessages.innerHTML = '';
                    $('#alert-message').find('.toast-body').html("Network error: API service is down. Please try again later.");
                    $('#alert-message').toast('show');
                }
            });
        } else {
            if($('.mic-icon').hasClass('on')) {
                $('#alert-message').find('.toast-body').text('Please stop the recording before submitting.');
            } else {
                $('#alert-message').find('.toast-body').text('Please enter a message before submitting.');
            }
            $('#alert-message').toast('show');
        }
    });
});