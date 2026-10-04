/* =========================================
   QUIZ QUESTION PICKER
   Lọc + đảo mảng + lấy số lượng câu hỏi
   const quizQuestions = QuizQuestionPicker.init({
    questions: questionsData,
    total: 20,

    conditions: {
        made: 1,
        type: "text",
        dangcauhoi: 5
    }
});
========================================= */

(function (window) {
    "use strict";

    function shuffleArray(array) {

        const result = array.slice();

        for (let i = result.length - 1; i > 0; i--) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
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


    function matchCondition(question, conditions) {

        if (!conditions) {
            return true;
        }

        /*
         * conditions có thể chứa:
         *
         * made
         * type
         * dangcauhoi
         *
         * hoặc các key khác sau này.
         */

        for (const key in conditions) {

            if (
                !Object.prototype.hasOwnProperty.call(
                    conditions,
                    key
                )
            ) {
                continue;
            }

            const expected =
                conditions[key];

            /*
             * Nếu điều kiện là undefined/null/""
             * thì bỏ qua.
             */

            if (
                expected === undefined ||
                expected === null ||
                expected === ""
            ) {
                continue;
            }


            /*
             * Nếu expected là Array:
             *
             * type: ["text", "multi"]
             *
             * thì chỉ cần giá trị question[key]
             * nằm trong array đó.
             */

            if (Array.isArray(expected)) {

                if (
                    !expected.includes(
                        question[key]
                    )
                ) {
                    return false;
                }

                continue;
            }


            /*
             * Điều kiện thông thường:
             *
             * made: 1
             * type: "text"
             * dangcauhoi: 5
             */

            if (
                question[key] !== expected
            ) {
                return false;
            }
        }

        return true;
    }


    function filterQuestions(
        questions,
        conditions
    ) {

        return questions.filter(
            function (question) {

                return matchCondition(
                    question,
                    conditions
                );
            }
        );
    }


    window.QuizQuestionPicker = {

        init: function (options) {

            options =
                options || {};


            /* =========================
               KIỂM TRA DATA
            ========================= */

            const sourceQuestions =
                Array.isArray(
                    options.questions
                )
                    ? options.questions
                    : [];


            if (
                sourceQuestions.length === 0
            ) {

                return [];
            }


            /* =========================
               LỌC THEO ĐIỀU KIỆN
            ========================= */

            let result =
                filterQuestions(
                    sourceQuestions,
                    options.conditions
                );


            /* =========================
               ĐẢO THỨ TỰ CÂU HỎI
            ========================= */

            result =
                shuffleArray(result);


            /* =========================
               SỐ CÂU MUỐN LẤY
            ========================= */

            let total =
                Number(options.total);


            /*
             * Nếu không truyền total
             * hoặc total không hợp lệ
             * thì lấy toàn bộ.
             */

            if (
                !Number.isFinite(total) ||
                total <= 0
            ) {

                total =
                    result.length;
            }


            total =
                Math.floor(total);


            /*
             * Nếu data > total:
             * lấy đúng total.
             *
             * Nếu data < total:
             * lấy bằng data.
             */

            total =
                Math.min(
                    total,
                    result.length
                );


            /* =========================
               TRẢ VỀ MẢNG ĐÃ CHỌN
            ========================= */

            return result.slice(
                0,
                total
            );
        }
    };

})(window);

