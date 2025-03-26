/**
 * @package    Speech-to-text
 * @version    1.0.0
 * @author     Your Name cletobarbosa89@gmail.com
 * @copyright  (c) 2025 Cleto Barbosa
 * @description Converts voice to text using browser API speech synthesizer.
 */

$(document).ready(function() {
    var final_transcript = '';
    var recognizing = false;
    var ignore_onend;
    var activeButton;
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    var two_line = /\n\n/g;
    var one_line = /\n/g;
    function linebreak(s) {
        return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
    }

    var first_char = /\S/;
    function capitalize(s) {
        return s.replace(first_char, function(m) { return m.toUpperCase(); });
    }

    recognition.onstart = function() {
        recognizing = true;
        activeButton.closest('.input-wrapper').find('.interim-wrap').addClass('block');
        activeButton.closest('.input-wrapper').find('.mic-icon').removeClass('off').addClass('on');
    };

    recognition.onend = function() {
        // final_transcript = '';
        // interim_transcript = '';
        recognizing = false;
        activeButton.closest('.input-wrapper').find('.interim-wrap').removeClass('block');
        activeButton.closest('.input-wrapper').find('.mic-icon').removeClass('on').addClass('off');
        activeButton.closest('.input-wrapper').find('.interim').html('');
        $('.mic').removeClass('disable');

        if (ignore_onend) {
            return;
        }

        if (!final_transcript) {
            return;
        }
    };

    recognition.onresult = function(event) {
        var interim_transcript = '';

        if (typeof(event.results) == 'undefined') {
            recognition.onend = null;
            recognition.stop();
            return;
        }

        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }

        final_transcript = capitalize(final_transcript);
        activeButton.closest('.input-wrapper').find('.interim').html(linebreak(interim_transcript));
        activeButton.closest('.input-wrapper').find('.final').val(linebreak(final_transcript));
    };

    $('.mic').on('click', function(event) {
        activeButton = $(this);

        $('.mic').not(this).addClass('disable');

        if (recognizing) {
            recognition.stop();
            return;
        }

        final_transcript = '';
        recognition.lang = "en-US";
        recognition.start();
        ignore_onend = false;
        activeButton.closest('.input-wrapper').find('.final').val('');
        activeButton.closest('.input-wrapper').find('.interim').html('');
        start_timestamp = event.timeStamp;
    });

    $('.final').on('keyup', function(e) {
        final_transcript = e.target.value;
    });

});