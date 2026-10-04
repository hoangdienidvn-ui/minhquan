(function () {

    "use strict";


    document.addEventListener(
        "DOMContentLoaded",
        function () {


            const showBtn =
                document.getElementById(
                    "showPrintPreview-1"
                );


            /*
             * Trang không có nút PDF
             * => không chạy
             */

            if (!showBtn) {
                return;
            }


            /* =================================================
               DELAY
            ================================================= */

            function delay(ms) {

                return new Promise(
                    function (resolve) {

                        setTimeout(
                            resolve,
                            ms
                        );

                    }
                );

            }


            /* =================================================
               CHECK LIBRARY
            ================================================= */

            function checkLibraries() {


                if (
                    typeof html2canvas ===
                    "undefined"
                ) {

                    throw new Error(
                        "html2canvas chưa được tải."
                    );

                }


                if (
                    !window.jspdf ||
                    !window.jspdf.jsPDF
                ) {

                    throw new Error(
                        "jsPDF chưa được tải."
                    );

                }

            }


            /* =================================================
               WAIT IMAGE
            ================================================= */

            async function waitImagesReady(
                root
            ) {


                const images =
                    Array.from(
                        root.querySelectorAll(
                            "img"
                        )
                    );


                await Promise.all(

                    images.map(
                        function (img) {


                            if (
                                img.complete &&
                                img.naturalWidth > 0
                            ) {


                                if (
                                    img.decode
                                ) {

                                    return img
                                        .decode()
                                        .catch(
                                            function () {}
                                        );

                                }


                                return Promise.resolve();

                            }


                            return new Promise(
                                function (
                                    resolve
                                ) {


                                    let done =
                                        false;


                                    function finish() {


                                        if (done) {
                                            return;
                                        }


                                        done =
                                            true;


                                        resolve();

                                    }


                                    img.addEventListener(
                                        "load",
                                        finish,
                                        {
                                            once:
                                                true
                                        }
                                    );


                                    img.addEventListener(
                                        "error",
                                        finish,
                                        {
                                            once:
                                                true
                                        }
                                    );


                                    setTimeout(
                                        finish,
                                        10000
                                    );

                                }
                            );

                        }
                    )

                );

            }


            /* =================================================
               IMAGE URL -> BASE64
            ================================================= */

            async function imageUrlToDataURL(
                url
            ) {


                try {


                    const response =
                        await fetch(
                            url,
                            {
                                mode:
                                    "cors",

                                cache:
                                    "force-cache"
                            }
                        );


                    if (
                        !response.ok
                    ) {

                        return null;

                    }


                    const blob =
                        await response.blob();


                    return await new Promise(
                        function (
                            resolve,
                            reject
                        ) {


                            const reader =
                                new FileReader();


                            reader.onloadend =
                                function () {

                                    resolve(
                                        reader.result
                                    );

                                };


                            reader.onerror =
                                reject;


                            reader.readAsDataURL(
                                blob
                            );

                        }
                    );

                }

                catch (
                    error
                ) {


                    console.warn(
                        "Không chuyển được ảnh:",
                        url
                    );


                    return null;

                }

            }


            /* =================================================
               PREPARE IMAGE
            ================================================= */

            async function prepareImagesForPdf(
                root
            ) {


                const images =
                    Array.from(
                        root.querySelectorAll(
                            "img"
                        )
                    );


                for (
                    let i = 0;
                    i < images.length;
                    i++
                ) {


                    const img =
                        images[i];


                    let src =
                        img.getAttribute(
                            "src"
                        );


                    if (!src) {
                        continue;
                    }


                    if (
                        src.startsWith(
                            "data:"
                        ) ||
                        src.startsWith(
                            "blob:"
                        )
                    ) {

                        continue;

                    }


                    try {

                        src =
                            new URL(
                                src,
                                window.location.href
                            ).href;

                    }

                    catch (
                        error
                    ) {}


                    const dataUrl =
                        await imageUrlToDataURL(
                            src
                        );


                    if (
                        dataUrl
                    ) {


                        img.removeAttribute(
                            "crossorigin"
                        );


                        img.src =
                            dataUrl;


                        try {

                            if (
                                img.decode
                            ) {

                                await img.decode();

                            }

                        }

                        catch (
                            error
                        ) {}

                    }


                    await delay(
                        20
                    );

                }

            }


            /* =================================================
               CREATE IMAGE
            ================================================= */

            function createPdfImage(
                original
            ) {


                const img =
                    document.createElement(
                        "img"
                    );


                img.src =
                    original.currentSrc ||
                    original.src;


                img.alt =
                    original.alt ||
                    "";


                Object.assign(
                    img.style,
                    {

                        display:
                            "block",

                        width:
                            "250px",

                        height:
                            "auto",

                        margin:
                            "0 auto"

                    }
                );


                return img;

            }


            /* =================================================
               CREATE PREVIEW
            ================================================= */

            function createPreview() {


                let oldWrap =
                    document.getElementById(
                        "pdfPreviewWrap-1"
                    );


                /*
                 * Preview đã tồn tại
                 * => không tạo thêm
                 */

                if (
                    oldWrap
                ) {

                    return oldWrap;

                }


                const questions =
                    Array.from(
                        document.querySelectorAll(
                            ".question-item-1"
                        )
                    );


                if (
                    !questions.length
                ) {

                    alert(
                        "Không tìm thấy câu hỏi."
                    );

                    return null;

                }


                /* =============================================
                   WRAP
                ============================================= */

                const wrap =
                    document.createElement(
                        "div"
                    );


                wrap.id =
                    "pdfPreviewWrap-1";


                document.body.appendChild(
                    wrap
                );


                /*
                 * Khóa trang phía sau
                 */

                document.body.style.overflow =
                    "hidden";


                /* =============================================
                   TOOLBAR
                ============================================= */

                const toolbar =
                    document.createElement(
                        "div"
                    );


                Object.assign(
                    toolbar.style,
                    {

                        width:
                            "794px",

                        maxWidth:
                            "calc(100vw - 20px)",

                        margin:
                            "0 auto 15px auto",

                        display:
                            "flex",

                        justifyContent:
                            "flex-end",

                        gap:
                            "10px",

                        position:
                            "sticky",

                        top:
                            "10px",

                        zIndex:
                            "9999"

                    }
                );


                /* =============================================
                   DOWNLOAD BUTTON
                ============================================= */

                const downloadBtn =
                    document.createElement(
                        "button"
                    );


                downloadBtn.type =
                    "button";


                downloadBtn.textContent =
                    "Tải PDF";


                Object.assign(
                    downloadBtn.style,
                    {

                        padding:
                            "10px 18px",

                        border:
                            "0",

                        borderRadius:
                            "8px",

                        background:
                            "#2563eb",

                        color:
                            "#fff",

                        fontSize:
                            "17px",

                        fontWeight:
                            "700",

                        cursor:
                            "pointer",

                        boxShadow:
                            "0 3px 12px rgba(0,0,0,.20)"

                    }
                );


                /* =============================================
                   HIDE BUTTON
                ============================================= */

                const hideBtn =
                    document.createElement(
                        "button"
                    );


                hideBtn.type =
                    "button";


                hideBtn.textContent =
                    "Ẩn bản in";


                Object.assign(
                    hideBtn.style,
                    {

                        padding:
                            "10px 18px",

                        border:
                            "0",

                        borderRadius:
                            "8px",

                        background:
                            "#475569",

                        color:
                            "#fff",

                        fontSize:
                            "17px",

                        fontWeight:
                            "700",

                        cursor:
                            "pointer",

                        boxShadow:
                            "0 3px 12px rgba(0,0,0,.20)"

                    }
                );


                toolbar.appendChild(
                    downloadBtn
                );


                toolbar.appendChild(
                    hideBtn
                );


                wrap.appendChild(
                    toolbar
                );


                /* =============================================
                   CONTENT
                ============================================= */

                const pdfContent =
                    document.createElement(
                        "div"
                    );


                pdfContent.id =
                    "pdfContent-1";


                wrap.appendChild(
                    pdfContent
                );


                /* =============================================
                   HEADER
                ============================================= */

                const header =
                    document.createElement(
                        "div"
                    );


                header.className =
                    "pdf-header-1";


                header.innerHTML = `

                    <div style="
                        padding-bottom:18px;
                        margin-bottom:20px;
                        border-bottom:2px solid #111827;
                    ">

                        <div style="
                            font-size:12px;
                            font-weight:700;
                            letter-spacing:1px;
                            color:#64748b;
                        ">
                            PHIẾU ÔN LUYỆN
                        </div>

                        <div style="
                            margin-top:4px;
                            font-size:28px;
                            font-weight:800;
                        ">
                            TOÁN LỚP 2
                        </div>

                        <div style="
                            margin-top:5px;
                            font-size:16px;
                            color:#64748b;
                        ">
                            Bài luyện tập tổng hợp
                        </div>

                    </div>


                    <div style="
                        display:grid;
                        grid-template-columns:1fr 180px;
                        gap:30px;
                        margin:28px 0;
                        font-size:14px;
                    ">

                        <div>
                            Họ và tên:

                            <span style="
                                display:inline-block;
                                width:70%;
                                border-bottom:1px solid #64748b;
                            ">
                                &nbsp;
                            </span>
                        </div>

                        <div>
                            Lớp:

                            <span style="
                                display:inline-block;
                                width:100px;
                                border-bottom:1px solid #64748b;
                            ">
                                &nbsp;
                            </span>
                        </div>

                    </div>

                `;


                pdfContent.appendChild(
                    header
                );


                /* =============================================
                   QUESTIONS
                ============================================= */

                questions.forEach(
                    function (
                        question,
                        index
                    ) {


                        const item =
                            document.createElement(
                                "div"
                            );


                        item.className =
                            "pdf-question-item-1";


                        /* =====================================
                           TITLE
                        ===================================== */

                        const title =
                            document.createElement(
                                "div"
                            );


                        title.innerHTML =
                            "<strong>Câu " +
                            (
                                index + 1
                            ) +
                            ".</strong>";


                        title.style.fontSize =
                            "18px";


                        title.style.marginBottom =
                            "7px";


                        item.appendChild(
                            title
                        );


                        /* =====================================
                           TEXT
                        ===================================== */

                        const textSource =
                            question.querySelector(
                                ".question-text-1"
                            );


                        if (
                            textSource
                        ) {


                            const text =
                                document.createElement(
                                    "div"
                                );


                            text.innerHTML =
                                textSource.innerHTML;


                            text.style.fontSize =
                                "18px";


                            text.style.lineHeight =
                                "1.6";


                            text.style.marginBottom =
                                "12px";


                            item.appendChild(
                                text
                            );

                        }


                        /* =====================================
                           IMAGE
                        ===================================== */

                        const originalImg =
                            question.querySelector(
                                ".question-image-1 img"
                            );


                        if (
                            originalImg
                        ) {


                            const imageWrap =
                                document.createElement(
                                    "div"
                                );


                            imageWrap.style.textAlign =
                                "center";


                            imageWrap.style.margin =
                                "14px 0";


                            imageWrap.appendChild(
                                createPdfImage(
                                    originalImg
                                )
                            );


                            item.appendChild(
                                imageWrap
                            );

                        }


                        /* =====================================
                           RADIO
                        ===================================== */

                        const answers =
                            Array.from(
                                question.querySelectorAll(
                                    ".answer-1"
                                )
                            );


                        if (
                            answers.length
                        ) {


                            const answerGrid =
                                document.createElement(
                                    "div"
                                );


                            Object.assign(
                                answerGrid.style,
                                {

                                    display:
                                        "grid",

                                    gridTemplateColumns:
                                        "1fr 1fr",

                                    columnGap:
                                        "30px",

                                    rowGap:
                                        "10px",

                                    marginTop:
                                        "12px"

                                }
                            );


                            answers.forEach(
                                function (
                                    answer,
                                    answerIndex
                                ) {


                                    const content =
                                        answer.querySelector(
                                            ".answer-content-1"
                                        );


                                    if (
                                        !content
                                    ) {

                                        return;

                                    }


                                    const row =
                                        document.createElement(
                                            "div"
                                        );


                                    row.innerHTML =

                                        "<strong>" +

                                        String.fromCharCode(
                                            65 +
                                            answerIndex
                                        ) +

                                        ".</strong> " +

                                        content.innerHTML;


                                    answerGrid.appendChild(
                                        row
                                    );

                                }
                            );


                            item.appendChild(
                                answerGrid
                            );

                        }


                        /* =====================================
                           TEXT ANSWER
                        ===================================== */

                        if (
                            question.querySelector(
                                ".text-answer-input-1"
                            )
                        ) {


                            const line =
                                document.createElement(
                                    "div"
                                );


                            line.style.marginTop =
                                "15px";


                            line.innerHTML = `

                                    <div style="
                                        display:flex;
                                        align-items:flex-end;
                                        width:100%;
                                        gap:8px;
                                    ">

                                        <span style="
                                            white-space:nowrap;
                                        ">
                                            Trả lời:
                                        </span>

                                        <span style="
                                            flex:1;
                                            border-bottom:2px dotted #111827;
                                            height:20px;
                                        "></span>

                                    </div>

                                `;


                            item.appendChild(
                                line
                            );

                        }


                        pdfContent.appendChild(
                            item
                        );

                    }
                );


                /* =============================================
                   MOBILE SCALE PREVIEW
                ============================================= */

                function updateScale() {


                    if (
                        window.innerWidth >
                        850
                    ) {

                        pdfContent.style.transform =
                            "";


                        pdfContent.style.transformOrigin =
                            "";


                        pdfContent.style.marginBottom =
                            "";


                        return;

                    }


                    const scale =
                        Math.min(

                            1,

                            (
                                window.innerWidth -
                                10
                            ) /

                            794

                        );


                    pdfContent.style.transform =
                        "scale(" +
                        scale +
                        ")";


                    pdfContent.style.transformOrigin =
                        "top left";


                    pdfContent.style.marginBottom =

                        "-" +

                        (
                            pdfContent.offsetHeight *

                            (
                                1 -
                                scale
                            )
                        ) +

                        "px";

                }


                updateScale();


                window.addEventListener(
                    "resize",
                    updateScale
                );


                /* =============================================
                   HIDE PREVIEW
                ============================================= */

                hideBtn.addEventListener(
                    "click",
                    function () {


                        /*
                         * Gỡ resize listener
                         */

                        window.removeEventListener(
                            "resize",
                            updateScale
                        );


                        /*
                         * Xóa preview
                         */

                        wrap.remove();


                        /*
                         * Mở scroll lại cho trang
                         */

                        document.body.style.overflow =
                            "";

                    }
                );


                /* =============================================
                   DOWNLOAD PDF
                ============================================= */

                downloadBtn.addEventListener(
                    "click",
                    async function () {


                        downloadBtn.disabled =
                            true;


                        downloadBtn.textContent =
                            "Đang tạo PDF...";


                        try {


                            await exportPdf(
                                pdfContent
                            );

                        }

                        catch (
                            error
                        ) {


                            console.error(
                                "PDF ERROR:",
                                error
                            );


                            alert(
                                "Không tạo được PDF: " +
                                (
                                    error.message ||
                                    error
                                )
                            );

                        }

                        finally {


                            downloadBtn.disabled =
                                false;


                            downloadBtn.textContent =
                                "Tải PDF";

                        }

                    }
                );


                return wrap;

            }


            /* =================================================
               ELEMENT -> CANVAS
            ================================================= */

            async function toCanvas(
                element
            ) {


                return await html2canvas(
                    element,
                    {

                        scale:
                            window.innerWidth <= 768
                                ? 1.15
                                : 1.5,

                        useCORS:
                            true,

                        allowTaint:
                            false,

                        backgroundColor:
                            "#fff",

                        logging:
                            false,

                        imageTimeout:
                            15000,

                        windowWidth:
                            794

                    }
                );

            }


            /* =================================================
               EXPORT
            ================================================= */

            async function exportPdf(
                pdfContent
            ) {


                checkLibraries();


                const jsPDF =
                    window.jspdf.jsPDF;


                const oldTransform =
                    pdfContent.style.transform;


                const oldTransformOrigin =
                    pdfContent.style.transformOrigin;


                const oldMargin =
                    pdfContent.style.marginBottom;


                /*
                 * Khi chụp PDF:
                 * bỏ scale mobile
                 */

                pdfContent.style.transform =
                    "none";


                pdfContent.style.transformOrigin =
                    "top left";


                pdfContent.style.marginBottom =
                    "0";


                try {


                    await prepareImagesForPdf(
                        pdfContent
                    );


                    await waitImagesReady(
                        pdfContent
                    );


                    await delay(
                        100
                    );


                    const pdf =
                        new jsPDF({

                            orientation:
                                "portrait",

                            unit:
                                "mm",

                            format:
                                "a4",

                            compress:
                                true

                        });


                    const PAGE_W =
                        210;


                    const PAGE_H =
                        297;


                    const LEFT =
                        12;


                    const RIGHT =
                        12;


                    const TOP =
                        12;


                    const BOTTOM =
                        18;


                    const CONTENT_W =
                        PAGE_W -
                        LEFT -
                        RIGHT;


                    const MAX_Y =
                        PAGE_H -
                        BOTTOM;


                    let y =
                        TOP;


                    const blocks =
                        [];


                    const header =
                        pdfContent.querySelector(
                            ".pdf-header-1"
                        );


                    if (
                        header
                    ) {

                        blocks.push(
                            header
                        );

                    }


                    pdfContent
                        .querySelectorAll(
                            ".pdf-question-item-1"
                        )
                        .forEach(
                            function (
                                item
                            ) {

                                blocks.push(
                                    item
                                );

                            }
                        );


                    /* =========================================
                       RENDER TỪNG BLOCK
                    ========================================= */

                    for (
                        let i = 0;
                        i < blocks.length;
                        i++
                    ) {


                        const block =
                            blocks[i];


                        await prepareImagesForPdf(
                            block
                        );


                        await waitImagesReady(
                            block
                        );


                        const canvas =
                            await toCanvas(
                                block
                            );


                        if (
                            !canvas ||
                            !canvas.width ||
                            !canvas.height
                        ) {

                            continue;

                        }


                        const image =
                            canvas.toDataURL(
                                "image/jpeg",
                                .92
                            );


                        let width =
                            CONTENT_W;


                        let height =
                            canvas.height *
                            width /
                            canvas.width;


                        /*
                         * Không đủ chỗ
                         * => sang trang mới
                         */

                        if (
                            y +
                            height >
                            MAX_Y &&
                            y >
                            TOP
                        ) {


                            pdf.addPage();


                            y =
                                TOP;

                        }


                        /*
                         * Block cao hơn cả 1 trang
                         */

                        const maxHeight =
                            PAGE_H -
                            TOP -
                            BOTTOM;


                        if (
                            height >
                            maxHeight
                        ) {


                            const ratio =
                                maxHeight /
                                height;


                            width *=
                                ratio;


                            height *=
                                ratio;

                        }


                        pdf.addImage(

                            image,

                            "JPEG",

                            LEFT,

                            y,

                            width,

                            height,

                            undefined,

                            "FAST"

                        );


                        y +=
                            height +
                            4;


                        /*
                         * Giải phóng canvas
                         */

                        canvas.width =
                            1;


                        canvas.height =
                            1;


                        await delay(
                            30
                        );

                    }


                    /* =========================================
                       FOOTER
                    ========================================= */

                    const pages =
                        pdf.getNumberOfPages();


                    for (
                        let page = 1;
                        page <= pages;
                        page++
                    ) {


                        pdf.setPage(
                            page
                        );


                        pdf.setFontSize(
                            9
                        );


                        pdf.setTextColor(
                            100,
                            116,
                            139
                        );


                        pdf.text(

                            "2026 - https://hminhquan2026.blogspot.com/",

                            PAGE_W / 2,

                            289,

                            {
                                align:
                                    "center"
                            }

                        );


                        pdf.text(

                            page +
                            " / " +
                            pages,

                            PAGE_W -
                            RIGHT,

                            289,

                            {
                                align:
                                    "right"
                            }

                        );

                    }


                    /* =========================================
                       FILE NAME
                    ========================================= */

                    let fileName =
                        "toan-lop-2.pdf";


                    const subtitle =
                        document.querySelector(
                            ".subtitle"
                        );


                    if (
                        subtitle &&
                        subtitle.textContent.trim()
                    ) {


                        const clean =
                            subtitle.textContent
                            .trim()
                            .normalize(
                                "NFD"
                            )
                            .replace(
                                /[\u0300-\u036f]/g,
                                ""
                            )
                            .replace(
                                /đ/g,
                                "d"
                            )
                            .replace(
                                /Đ/g,
                                "D"
                            )
                            .replace(
                                /[^a-zA-Z0-9]+/g,
                                "-"
                            )
                            .replace(
                                /^-+|-+$/g,
                                ""
                            )
                            .toLowerCase();


                        if (
                            clean
                        ) {

                            fileName =
                                clean +
                                ".pdf";

                        }

                    }


                    pdf.save(
                        fileName
                    );

                }

                finally {


                    /*
                     * Trả lại trạng thái preview
                     */

                    pdfContent.style.transform =
                        oldTransform;


                    pdfContent.style.transformOrigin =
                        oldTransformOrigin;


                    pdfContent.style.marginBottom =
                        oldMargin;

                }

            }


            /* =================================================
               BUTTON
            ================================================= */

            showBtn.addEventListener(
                "click",
                function () {

                    createPreview();

                }
            );


        }
    );

})();