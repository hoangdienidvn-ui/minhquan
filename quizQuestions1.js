(function () {

    "use strict";

    document.addEventListener(
        "DOMContentLoaded",
        function () {


            const questions =
                Array.from(
                    document.querySelectorAll(
                        ".question-item-1"
                    )
                );


            /*
             * Trang không có quiz
             * => không chạy
             */
            if (!questions.length) {
                return;
            }


            const grid =
                document.getElementById(
                    "questionGrid-1"
                );

            const answeredCount =
                document.getElementById(
                    "answeredCount-1"
                );

            const unansweredCount =
                document.getElementById(
                    "unansweredCount-1"
                );

            const sidebar =
                document.getElementById(
                    "quizSidebar-1"
                );

            const openMenu =
                document.getElementById(
                    "openQuizMenu-1"
                );

            const closeMenu =
                document.getElementById(
                    "closeQuizMenu-1"
                );


            if (
                !grid ||
                !answeredCount ||
                !unansweredCount
            ) {

                return;

            }


            let isSidebarScrolling =
                false;

            let scrollTimer =
                null;


            /* =================================================
               GRID
            ================================================= */

            questions.forEach(
                function (
                    question,
                    index
                ) {


                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";

                    button.className =
                        "question-btn-1";

                    button.textContent =
                        index + 1;

                    button.dataset.question =
                        index + 1;


                    button.addEventListener(
                        "click",
                        function () {


                            const number =
                                index + 1;


                            setActiveQuestion(
                                number
                            );


                            isSidebarScrolling =
                                true;


                            const top =
                                question
                                .getBoundingClientRect()
                                .top +

                                window.pageYOffset -

                                15;


                            window.scrollTo({

                                top:
                                    top,

                                behavior:
                                    "smooth"

                            });


                            if (
                                window.innerWidth <= 768 &&
                                sidebar
                            ) {

                                sidebar
                                    .classList
                                    .remove(
                                        "open-1"
                                    );

                            }


                            clearTimeout(
                                scrollTimer
                            );


                            scrollTimer =
                                setTimeout(
                                    function () {

                                        isSidebarScrolling =
                                            false;

                                        updateActiveByScroll();

                                    },
                                    700
                                );

                        }
                    );


                    grid.appendChild(
                        button
                    );

                }
            );


            /* =================================================
               ACTIVE QUESTION
            ================================================= */

            function setActiveQuestion(
                number
            ) {


                const buttons =
                    grid.querySelectorAll(
                        ".question-btn-1"
                    );


                buttons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "current-1"
                        );

                    }
                );


                const active =
                    grid.querySelector(

                        '[data-question="' +
                        number +
                        '"]'

                    );


                if (active) {

                    active.classList.add(
                        "current-1"
                    );

                }

            }


            /* =================================================
               NORMALIZE
            ================================================= */

            function normalizeAnswer(
                value
            ) {

                return String(
                    value ?? ""
                )
                    /* Bỏ khoảng trắng đầu / cuối */
                    .trim()

                    /* × hoặc X -> x */
                    .replace(
                        /[×X]/g,
                        "x"
                    )

                    /* Dấu phẩy và chấm phẩy được xem như cùng một dấu phân cách */
                    .replace(
                        /,/g,
                        ";"
                    )

                    /* Bỏ khoảng trắng quanh dấu ; */
                    .replace(
                        /\s*;\s*/g,
                        ";"
                    )

                    /* Bỏ khoảng trắng quanh phép nhân x */
                    .replace(
                        /\s*x\s*/g,
                        "x"
                    )

                    /* Chuẩn hóa nhiều khoảng trắng liên tiếp */
                    .replace(
                        /\s+/g,
                        " "
                    )

                    /* Bỏ dấu câu thừa ở cuối, nhưng giữ dấu . bên trong số như 79.58 */
                    .replace(
                        /[.,;:!?]+$/g,
                        ""
                    )

                    /* Bỏ khoảng trắng lần cuối */
                    .trim();

            }


            /* =================================================
               STATS
            ================================================= */

            function updateStats() {


                let answered =
                    0;


                questions.forEach(
                    function (question) {

                        if (
                            question.dataset.status ===
                                "correct" ||

                            question.dataset.status ===
                                "wrong"
                        ) {

                            answered++;

                        }

                    }
                );


                answeredCount.textContent =
                    answered;


                unansweredCount.textContent =
                    questions.length -
                    answered;

            }


            /* =================================================
               GRID STATUS
            ================================================= */

            function updateGrid(
                questionIndex,
                status
            ) {


                const button =
                    grid.querySelector(

                        '[data-question="' +
                        questionIndex +
                        '"]'

                    );


                if (!button) {
                    return;
                }


                button.classList.remove(
                    "correct-1",
                    "wrong-1"
                );


                if (
                    status ===
                    "correct"
                ) {

                    button.classList.add(
                        "correct-1"
                    );

                }


                if (
                    status ===
                    "wrong"
                ) {

                    button.classList.add(
                        "wrong-1"
                    );

                }

            }


            /* =================================================
               LOCK QUESTION
            ================================================= */

            function lockQuestion(
                question
            ) {


                question.dataset.locked =
                    "true";


                const textInput =
                    question.querySelector(
                        ".text-answer-input-1"
                    );


                if (textInput) {

                    textInput.disabled =
                        true;

                }


                const answerButton =
                    question.querySelector(
                        ".check-answer-btn-1"
                    );


                if (answerButton) {

                    answerButton.disabled =
                        true;

                    answerButton.textContent =
                        "Đã trả lời";

                }


                const radios =
                    question.querySelectorAll(
                        'input[type="radio"]'
                    );


                radios.forEach(
                    function (radio) {

                        radio.disabled =
                            true;

                    }
                );


                question.classList.add(
                    "answered-1"
                );

            }


            /* =================================================
               QUESTIONS
            ================================================= */

            questions.forEach(
                function (
                    question,
                    index
                ) {


                    const type =
                        question.dataset.type;


                    const correctAnswer =
                        normalizeAnswer(
                            question.dataset.answer
                        );


                    const solution =
                        question.querySelector(
                            ".solution-1"
                        );


                    /* =============================================
                       TEXT
                    ============================================= */

                    if (
                        type ===
                        "text"
                    ) {


                        const input =
                            question.querySelector(
                                ".text-answer-input-1"
                            );


                        const button =
                            question.querySelector(
                                ".check-answer-btn-1"
                            );


                        if (
                            !input ||
                            !button
                        ) {

                            return;

                        }


                        function checkTextAnswer() {


                            if (
                                question.dataset.locked ===
                                    "true" ||

                                question.dataset.status
                            ) {

                                return;

                            }


                            const value =
                                normalizeAnswer(
                                    input.value
                                );


                            if (!value) {

                                input.focus();

                                return;

                            }


                            input.classList.remove(
                                "correct-1",
                                "wrong-1"
                            );


                            if (
                                value ===
                                    correctAnswer ||

                                value.startsWith(
                                    correctAnswer +
                                    " "
                                )
                            ) {


                                input.classList.add(
                                    "correct-1"
                                );


                                question.dataset.status =
                                    "correct";


                                updateGrid(
                                    index + 1,
                                    "correct"
                                );

                            }

                            else {


                                input.classList.add(
                                    "wrong-1"
                                );


                                question.dataset.status =
                                    "wrong";


                                updateGrid(
                                    index + 1,
                                    "wrong"
                                );

                            }


                            if (solution) {

                                solution.classList.add(
                                    "show-1"
                                );

                            }


                            lockQuestion(
                                question
                            );


                            updateStats();

                        }


                        button.addEventListener(
                            "click",
                            checkTextAnswer
                        );


                        input.addEventListener(
                            "keydown",
                            function (event) {

                                if (
                                    event.key ===
                                    "Enter"
                                ) {

                                    checkTextAnswer();

                                }

                            }
                        );

                    }


                    /* =============================================
                       RADIO
                    ============================================= */

                    if (
                        type ===
                        "radio"
                    ) {


                        const answers =
                            question
                            .querySelectorAll(
                                ".answer-1"
                            );


                        answers.forEach(
                            function (answer) {


                                answer.addEventListener(
                                    "click",
                                    function () {


                                        if (
                                            question.dataset.locked ===
                                                "true" ||

                                            question.dataset.status
                                        ) {

                                            return;

                                        }


                                        answers.forEach(
                                            function (
                                                item
                                            ) {

                                                item.classList.remove(
                                                    "selected-1",
                                                    "correct-1",
                                                    "wrong-1"
                                                );

                                            }
                                        );


                                        const input =
                                            answer.querySelector(
                                                "input"
                                            );


                                        if (!input) {
                                            return;
                                        }


                                        input.checked =
                                            true;


                                        answer.classList.add(
                                            "selected-1"
                                        );


                                        const selectedValue =
                                            normalizeAnswer(
                                                input.value
                                            );


                                        if (
                                            selectedValue ===
                                            correctAnswer
                                        ) {


                                            answer.classList.add(
                                                "correct-1"
                                            );


                                            question.dataset.status =
                                                "correct";


                                            updateGrid(
                                                index + 1,
                                                "correct"
                                            );

                                        }

                                        else {


                                            answer.classList.add(
                                                "wrong-1"
                                            );


                                            question.dataset.status =
                                                "wrong";


                                            updateGrid(
                                                index + 1,
                                                "wrong"
                                            );


                                            /*
                                             * Hiện đáp án đúng
                                             */

                                            answers.forEach(
                                                function (
                                                    item
                                                ) {


                                                    const radio =
                                                        item.querySelector(
                                                            "input"
                                                        );


                                                    if (!radio) {
                                                        return;
                                                    }


                                                    if (
                                                        normalizeAnswer(
                                                            radio.value
                                                        ) ===
                                                        correctAnswer
                                                    ) {

                                                        item.classList.add(
                                                            "correct-1"
                                                        );

                                                    }

                                                }
                                            );

                                        }


                                        if (
                                            solution
                                        ) {

                                            solution.classList.add(
                                                "show-1"
                                            );

                                        }


                                        lockQuestion(
                                            question
                                        );


                                        updateStats();

                                    }
                                );

                            }
                        );

                    }

                }
            );


            /* =================================================
               MOBILE SIDEBAR
            ================================================= */

            if (openMenu) {

                openMenu.addEventListener(
                    "click",
                    function () {

                        if (sidebar) {

                            sidebar.classList.add(
                                "open-1"
                            );

                        }

                    }
                );

            }


            if (closeMenu) {

                closeMenu.addEventListener(
                    "click",
                    function () {

                        if (sidebar) {

                            sidebar.classList.remove(
                                "open-1"
                            );

                        }

                    }
                );

            }


            /* =================================================
               ACTIVE SCROLL
            ================================================= */

            function updateActiveByScroll() {


                if (
                    isSidebarScrolling
                ) {

                    return;

                }


                let closestQuestion =
                    null;


                let closestDistance =
                    Infinity;


                const targetY =
                    window.innerHeight *
                    .28;


                questions.forEach(
                    function (question) {


                        const rect =
                            question
                            .getBoundingClientRect();


                        const distance =
                            Math.abs(
                                rect.top -
                                targetY
                            );


                        if (
                            rect.bottom > 0 &&

                            rect.top <
                                window.innerHeight &&

                            distance <
                                closestDistance
                        ) {


                            closestDistance =
                                distance;


                            closestQuestion =
                                question;

                        }

                    }
                );


                if (
                    closestQuestion
                ) {

                    setActiveQuestion(
                        closestQuestion
                            .dataset
                            .questionIndex
                    );

                }

            }


            let scrollRAF =
                null;


            window.addEventListener(
                "scroll",
                function () {


                    if (
                        scrollRAF
                    ) {

                        cancelAnimationFrame(
                            scrollRAF
                        );

                    }


                    scrollRAF =
                        requestAnimationFrame(
                            updateActiveByScroll
                        );

                },
                {
                    passive:
                        true
                }
            );


            window.addEventListener(
                "resize",
                updateActiveByScroll
            );


            /* =================================================
               INIT
            ================================================= */

            updateStats();

            updateActiveByScroll();

        }
    );

})();
