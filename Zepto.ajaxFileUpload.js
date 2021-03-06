(function ($) {
    function createUploadIframe(id, uri) {
        id = id || +new Date;
        id = 'jUploadFrame-' + id;
        return $('<iframe>', {
            id: id,
            name: id,
            style: 'position: absolute; top: -9999px; left: -9999px',
            src: window.ActiveXObject ? (typeof  uri === 'boolean' ? 'javascript:false' : (typeof uri === 'string' ? uri : '')) : ''
        }).appendTo(document.body)
    }

    function createUploadForm(id, fileSelector, data) {
        id = 'jUploadFormId-' + id;
        var fileId = 'jUploadFile' + id,
            $file = $(fileSelector),
            $form = $('<form>', {
                action: '',
                method: 'post',
                name: id,
                id: id,
                enctype: 'multipart/form-data',
                style: 'position: absolute; top: -9999px; left: -9999px'
            });
        $.isArray(data) && data.forEach(function (item) {
            $form.append($('<input>', {
                type: 'hidden',
                name: item.name,
                value: item.value
            }))
        });
        return $form.append($file.before($file.clone())).appendTo(document.body);
    }

    function uploadData(r, type) {
        var data = type === 'xml' || !type ? r.responseXML : r.responseText;
        type === 'json' && (data = JSON.parse(data));
        return data;
    }

    $.ajaxFileUpload = function (s) {
        s = $.extend({}, $.ajaxSettings, s);
        var id = +new Date,
            d = $.Deferred(),
            $form = createUploadForm(id, s.fileElement || ('#' + s.fileElementId), s.data),
            $io = createUploadIframe(id, s.secureuri),
            io = $io.get(0),
            frameId = 'jUploadFrame' + id,
            xml = {},
            status,
            requestDone = false;
        var uploadCallback = function (isTimeout) {
            if(requestDone) return;
            requestDone = true;
            if (io.contentWindow) {
                xml.responseText = io.contentWindow.document.body ? io.contentWindow.document.body.innerHTML : null;
                xml.responseXML = io.contentWindow.document.XMLDocument ? io.contentWindow.document.XMLDocument : io.contentWindow.document;
            } else if (io.contentDocument) {
                xml.responseText = io.contentDocument.document.body ? io.contentDocument.document.body.innerHTML : null;
                xml.responseXML = io.contentDocument.document.XMLDocument ? io.contentDocument.document.XMLDocument : io.contentDocument.document;
            }
            
            status = isTimeout === true ? 'error' : 'success';
            status === 'success' ? s.success && s.success(uploadData(xml, s.dataType)) : (s.error && s.error())
            s.complete && s.complete(uploadData(xml, s.dataType))
            setTimeout(function () {
                $io.remove();
                $form.remove();
            }, 100);
        };
        s.timeout > 0 && setTimeout(function () {uploadCallback(true);}, s.timeout);
        $form.attr({
            action: s.url,
            target: frameId,
            method: s.type || 'POST',
            enctype: 'multipart/form-data',
        }).submit();
        $io.on('load', function() {uploadCallback()});
    };
    
    $.fn.submitWithFile = function(settings) {
        $.ajaxFileUpload($.extend(settings, {
            fileElement: this.find(settings.fileElement || 'input[type=file]'),
            data: settings.data || this.serializeArray(),
        }))
    }
})(Zepto);
