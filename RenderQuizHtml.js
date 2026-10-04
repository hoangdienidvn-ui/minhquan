
/* =========================================================
   RENDER QUIZ HTML
   - Render câu hỏi
   - Render đáp án
   - Render ảnh
   - Shuffle đáp án
   - Render số câu sidebar
   - Mở / đóng sidebar mobile
   - Click số câu để cuộn tới câu hỏi
========================================================= */
/* =========================================================
   RENDER QUIZ HTML

   CHỈ LÀM:
   - Render câu hỏi
   - Render đáp án
   - Render ảnh
   - Shuffle đáp án

   KHÔNG LÀM:
   - Không render sidebar
   - Không tạo question-btn-1
   - Không chấm điểm
   - Không update stats
   - Không mở/đóng sidebar
   - Không active scroll

   Các chức năng đó để QuizGrader xử lý.
========================================================= */

(function (window) {

    "use strict";


    /* =========================================================
       DATA
    ========================================================= */

    let questions = [];
   const MEDIA_URL = "https://archive.org/download/";

    /* =========================================================
       SETTINGS
    ========================================================= */

    let settings = {

        folder: "",

        shuffleAnswers: false
    };


    /* =========================================================
       GET IMAGE URL
    ========================================================= */

    function getImageUrl(src) {

        if (!src) {

            return "";
        }


        src =
            String(src).trim();


        /* =====================================================
           URL ĐẦY ĐỦ
        ===================================================== */

        if (
            src.indexOf("http://") === 0 ||
            src.indexOf("https://") === 0 ||
            src.indexOf("//") === 0 ||
            src.indexOf("data:") === 0 ||
            src.indexOf("blob:") === 0
        ) {

            return src;
        }


        /* =====================================================
           KIỂM TRA MEDIA_URL
        ===================================================== */

        if (
            typeof MEDIA_URL ===
            "undefined"
        ) {

            return src;
        }


        const baseUrl =
            String(MEDIA_URL)
                .replace(
                    /\/+$/,
                    ""
                );


        /* =====================================================
           CÓ FOLDER
        ===================================================== */

        if (
            settings.folder
        ) {

            return (

                baseUrl

                +

                "/"

                +

                String(
                    settings.folder
                )
                    .trim()
                    .replace(
                        /^\/+|\/+$/g,
                        ""
                    )

                +

                "/"

                +

                src.replace(
                    /^\/+/,
                    ""
                )
            );
        }


        /* =====================================================
           KHÔNG CÓ FOLDER
        ===================================================== */

        return (

            baseUrl

            +

            "/"

            +

            src.replace(
                /^\/+/,
                ""
            )
        );
    }


    /* =========================================================
       FIX IMAGES TRONG HTML
    ========================================================= */

    function fixImages(element) {

        if (!element) {

            return;
        }


        element
            .querySelectorAll(
                "img"
            )
            .forEach(

                function (img) {

                    const src =
                        img.getAttribute(
                            "src"
                        );


                    if (!src) {

                        return;
                    }


                    img.src =
                        getImageUrl(
                            src
                        );
                }
            );
    }


    /* =========================================================
       SHUFFLE ARRAY
    ========================================================= */

    function shuffleArray(array) {

        const result =
            array.slice();


        for (
            let i =
                result.length - 1;

            i > 0;

            i--
        ) {

            const j =
                Math.floor(

                    Math.random() *

                    (i + 1)
                );


            [
                result[i],
                result[j]

            ] = [

                result[j],
                result[i]
            ];
        }


        return result;
    }


    /* =========================================================
       FORMAT SOLUTION
    ========================================================= */

    function formatSolution(value) {

        if (
            value === undefined ||
            value === null
        ) {

            return "";
        }


        return String(value)

            .replace(
                /\r\n/g,
                "\n"
            )

            .replace(
                /\r/g,
                "\n"
            )

            .replace(
                /\n/g,
                "<br>"
            );
    }


    /* =========================================================
       CREATE QUESTION
    ========================================================= */

    function createQuestion(
        question,
        index
    ) {

        const questionId =
            index + 1;


        /* =====================================================
           TYPE

           QuizGrader hiện tại đọc:
           question.dataset.type

           và chỉ hiểu:
           "text"
           "radio"
        ===================================================== */

        const htmlType =

            question.type ===
                "text"

                ? "text"

                : "radio";


        /* =====================================================
           QUESTION SECTION
        ===================================================== */

        const section =
            document.createElement(
                "section"
            );


        section.className =
            "question-item-1";


        section.id =

            "question-" +

            questionId +

            "-1";


        /*
         * QuizGrader cần:
         *
         * data-question-index
         */

        section.setAttribute(
            "data-question-index",
            questionId
        );


        /*
         * QuizGrader cần:
         *
         * data-type
         */

        section.setAttribute(
            "data-type",
            htmlType
        );


        /*
         * QuizGrader cần:
         *
         * data-answer
         */

        section.setAttribute(
            "data-answer",
            question.answer ?? ""
        );


        /* =====================================================
           QUESTION NUMBER
        ===================================================== */

        const questionNumber =
            document.createElement(
                "h2"
            );


        questionNumber.className =
            "question-number-1";


        questionNumber.textContent =

            "Câu " +

            questionId;


        section.appendChild(
            questionNumber
        );


        /* =====================================================
           QUESTION TEXT
        ===================================================== */

        const questionText =
            document.createElement(
                "div"
            );


        questionText.className =
            "question-text-1";


        questionText.innerHTML =
            question.cauhoi || "";


        fixImages(
            questionText
        );


        section.appendChild(
            questionText
        );


        /* =====================================================
           QUESTION IMAGE
        ===================================================== */

        if (
            question.img &&
            String(
                question.img
            ).trim()
        ) {

            const imageWrap =
                document.createElement(
                    "div"
                );


            imageWrap.className =
                "question-image-1";


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                getImageUrl(
                    question.img
                );


            image.alt =

                "Hình câu " +

                questionId;


            imageWrap.appendChild(
                image
            );


            section.appendChild(
                imageWrap
            );
        }


        /* =====================================================
           TEXT QUESTION
        ===================================================== */

        if (
            htmlType ===
            "text"
        ) {

            const answerBox =
                document.createElement(
                    "div"
                );


            answerBox.className =
                "text-answer-box-1";


            /* =================================================
               INPUT

               QuizGrader tìm:
               .text-answer-input-1
            ================================================= */

            const input =
                document.createElement(
                    "input"
                );


            input.type =
                "text";


            input.className =
                "text-answer-input-1";


            input.placeholder =
                "Nhập đáp án...";


            input.autocomplete =
                "off";


            /* =================================================
               BUTTON

               QuizGrader tìm:
               .check-answer-btn-1
            ================================================= */

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "check-answer-btn-1";


            button.textContent =
                "Trả lời";


            /* APPEND */

            answerBox.appendChild(
                input
            );


            answerBox.appendChild(
                button
            );


            section.appendChild(
                answerBox
            );
        }


        /* =====================================================
           MULTI / RADIO QUESTION
        ===================================================== */

        else {

            const answersWrap =
                document.createElement(
                    "div"
                );


            answersWrap.className =
                "answers-1";


            /* =================================================
               ANSWERS
            ================================================= */

            let answers = [

                question.answer,

                ...(

                    Array.isArray(
                        question.wrong_answers
                    )

                        ? question.wrong_answers

                        : []
                )
            ];


            /* =================================================
               REMOVE NULL / DUPLICATE
            ================================================= */

            answers = [

                ...new Set(

                    answers

                        .filter(

                            function (answer) {

                                return (

                                    answer !==
                                        undefined

                                    &&

                                    answer !==
                                        null
                                );
                            }
                        )

                        .map(
                            String
                        )
                )
            ];


            /* =================================================
               SHUFFLE ANSWERS
            ================================================= */

            if (
                settings.shuffleAnswers
            ) {

                answers =
                    shuffleArray(
                        answers
                    );
            }


            /* =================================================
               RENDER ANSWERS
            ================================================= */

            answers.forEach(

                function (
                    answer,
                    answerIndex
                ) {

                    /*
                     * QuizGrader tìm:
                     *
                     * .answer-1
                     */

                    const label =
                        document.createElement(
                            "label"
                        );


                    label.className =
                        "answer-1";


                    /* =========================================
                       RADIO

                       QuizGrader lấy:
                       input.value
                    ========================================= */

                    const input =
                        document.createElement(
                            "input"
                        );


                    input.type =
                        "radio";


                    input.name =

                        "question-" +

                        questionId +

                        "-1";


                    input.value =
                        answer;


                    /* =========================================
                       A B C D
                    ========================================= */

                    const answerLabel =
                        document.createElement(
                            "span"
                        );


                    answerLabel.className =
                        "answer-label-1";


                    answerLabel.textContent =
                        String.fromCharCode(

                            65 +

                            answerIndex
                        );


                    /* =========================================
                       ANSWER CONTENT
                    ========================================= */

                    const answerContent =
                        document.createElement(
                            "span"
                        );


                    answerContent.className =
                        "answer-content-1";


                    answerContent.innerHTML =
                        answer;


                    fixImages(
                        answerContent
                    );


                    /* =========================================
                       APPEND
                    ========================================= */

                    label.appendChild(
                        input
                    );


                    label.appendChild(
                        answerLabel
                    );


                    label.appendChild(
                        answerContent
                    );


                    answersWrap.appendChild(
                        label
                    );
                }
            );


            section.appendChild(
                answersWrap
            );
        }


        /* =====================================================
           SOLUTION

           QuizGrader tìm:
           .solution-1
        ===================================================== */

        const solution =
            document.createElement(
                "div"
            );


        solution.className =
            "solution-1";


        solution.innerHTML =

            "<strong>Giải thích:</strong><br>"

            +

            formatSolution(
                question.solution
            );


        fixImages(
            solution
        );


        section.appendChild(
            solution
        );


        /* =====================================================
           RETURN
        ===================================================== */

        return section;
    }


    /* =========================================================
       RENDER
    ========================================================= */

    function render() {

        const container =
            document.getElementById(
                "questionsList-1"
            );


        if (!container) {

            console.error(
                "Không tìm thấy #questionsList-1"
            );


            return;
        }


        /* =====================================================
           RESET QUESTION LIST
        ===================================================== */

        container.innerHTML =
            "";


        /* =====================================================
           QUAN TRỌNG

           KHÔNG ĐỘNG VÀO:
           #questionGrid-1

           QuizGrader sẽ tự render sidebar.
        ===================================================== */


        /* =====================================================
           RENDER QUESTIONS
        ===================================================== */

        questions.forEach(

            function (
                question,
                index
            ) {

                container.appendChild(

                    createQuestion(
                        question,
                        index
                    )
                );
            }
        );
    }


    /* =========================================================
       PUBLIC API
    ========================================================= */

    window.RenderQuizHtml = {


        /* =====================================================
           INIT
        ===================================================== */

        init:
            function (options) {

                options =
                    options || {};


                if (
                    !Array.isArray(
                        options.questions
                    )
                ) {

                    console.error(
                        "RenderQuizHtml.init(): questions phải là Array."
                    );


                    return [];
                }


                /* =============================================
                   DATA
                ============================================= */

                questions =
                    options.questions.slice();


                /* =============================================
                   SETTINGS
                ============================================= */

                settings = {

                    folder:
                        options.folder ||
                        "",


                    shuffleAnswers:

                        options.shuffleAnswers ===
                        true
                };


                /* =============================================
                   RENDER
                ============================================= */

                render();


                return questions.slice();
            },


        /* =====================================================
           RENDER AGAIN
        ===================================================== */

        render:
            function () {

                render();
            },


        /* =====================================================
           GET QUESTIONS
        ===================================================== */

        getQuestions:
            function () {

                return questions.slice();
            },


        /* =====================================================
           DESTROY
        ===================================================== */

        destroy:
            function () {

                const container =
                    document.getElementById(
                        "questionsList-1"
                    );


                if (container) {

                    container.innerHTML =
                        "";
                }


                questions =
                    [];
            }
    };


})(window);
