﻿$(function () {

    var DELETE = 46;
    var BACKSPACE = 8;
    var DEFAULT_ZOOM_SLIDER_POSITION = "50%";
    var ZOOM_FOR_STOCK_IMAGES = "50%";
    var activeTextContainer = 1;
    var uploadedImageWidth = 0;
    var uploadedImageHeight = 0;
    var UUID_REGEX = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    var originalButtonBackground = null;
    var recentDesignData = {};

    // Call all of the UI initializers & wire up all behaviors
    initUI();


    // --------------------------------------------------------------------
    // FUNCTIONS FOR GRAPHIC
    // Graphic and Stock Image are the same thing. Need to normalize names.
    // --------------------------------------------------------------------

    // Remove the stock image & related settings
    function clearStockImage() {
        if ($('#cyoGraphicIsBackground').val() == 'false') {
            $('#cyoOverlayStockImage .cyoImgContainer').html('');
            $('#cyoOverlayStockImage').hide();
        }
        else {
            $('#cyoSample').css('background-image', 'none');
        }
        clearSettings('#cyoAddGraphicContainer');
        clearFormDataForGraphic();
        return false;
    }

    // When set as background, reduce stock image zoom so it fits in binky 
    function setZoomForStockImage() {
        $('#cyoSample').css('background-size', ZOOM_FOR_STOCK_IMAGES)
        $('#uploadSizeSlider a').css('left', ZOOM_FOR_STOCK_IMAGES);
        $('#cyoBgImageZoom').val(ZOOM_FOR_STOCK_IMAGES);
    }

    // Resize the image to match the dimensions of its container div.
    // This actually resizes both the image and the div as the user 
    // drags the corner of the div. It uses a css trick: when we reset
    // the height of the image *without resetting the image width*,
    // the browser automatically re-calculates the image width to preserve
    // the original proportions, which is what we want. We then set the
    // width of div to match whatever the browser calculated as the
    // width of the image.
    function sizeImageToDiv(divId) {
        var imgElement = $(divId + ' .cyoImgContainer img');
        imgElement.attr('height', $(divId).height());
        $(divId).css('width', imgElement.width() + "px");
        setFormDataForGraphic();
    }

    // Set the hidden form data for the graphic currently showing in the overlay.
    function setFormDataForGraphic() {
        var graphicUrl = $('#cyoModalGraphic .chooser img.selected').attr('src');
        $('#cyoGraphic').val(graphicUrl.replace(/_thumb/, '').replace(".jpg", ".png"));
        $('#cyoGraphicTop').val($('#cyoOverlayStockImage').offset().top);
        $('#cyoGraphicLeft').val($('#cyoOverlayStockImage').offset().left);
        $('#cyoGraphicWidth').val($('#cyoOverlayStockImage').width());
        $('#cyoGraphicHeight').val($('#cyoOverlayStockImage').height());
        $('#cyoGraphicZoom').val($('#cyoOverlayStockImage').css('zoom') * $('#cyoSample').css('zoom'));
    }

    // When user deletes the graphic in the overlay, clear out the form data for that graphic.
    function clearFormDataForGraphic() {
        $('#cyoGraphic').val('');
        $('#cyoGraphicIsBackground').val('false');
        $('#cyoGraphicTop').val('');
        $('#cyoGraphicLeft').val('');
        $('#cyoGraphicWidth').val('');
        $('#cyoGraphicHeight').val('');
        $('#cyoGraphicZoom').val('');
    }

    // --------------------------------------------------------------------
    // FUNCTIONS FOR UPLOADED IMAGE
    // --------------------------------------------------------------------

    // Display the uploaded image on the binky
    function showUploadAsBackground(imgUrl) {
        setBinkyBackground(imgUrl);
        removeOldUploadsFromDisplay();
        // Show the name of the uploaded image next to the button.
        showSettings('#cyoUploadImageContainer', $('.qq-upload-file').text());
    }

    // Remove older photos from the upload dialog, 
    // since we don't have a way of getting back to them.
    function removeOldUploadsFromDisplay() {
        var imageCount = $('.qq-upload-success').length;
        if (imageCount > 1) {
            $('.qq-upload-success').each(function (index, element) {
                if (index == 0) {
                    $(element).remove();
                }
            });
        }
    }

    // Remove the uploaded image from the overlay and clear
    // the settings display to the right of the button. The
    // uploaded image is still available in the upload dialog.
    function clearUploadedImage() {
        if (bgImageWasUploadedByUser())
            setBinkyBackground('');
        clearSettings('#cyoUploadImageContainer');
        return false;
    }


    // --------------------------------------------------------------------
    // FUNCTIONS FOR CUSTOM TEXT
    // --------------------------------------------------------------------

    // Clear the text overlay and the settings that appear
    // to the right of the Text button.
    function clearText() {
        $('#cyoTextContent' + activeTextContainer).html('');
        $('#cyoCustomText').val('');
        $('#cyoText' + activeTextContainer).val('');
        clearSettings('#cyoAddTextContainer' + activeTextContainer);
    }

    // Load custom text settings from the hidden vars back into the UI controls.
    // User may be switching back and forth between text1 and text2, so we need
    // to load the correct values for whatever they're working with.
    function loadTextSettings() {
        var text = $('#cyoText' + activeTextContainer).val();
        $('#cyoCustomText').val(text);

        var color = $('#cyoFontColor' + activeTextContainer).val();
        $("#cyoTextColor").spectrum("set", color);

        var font = $('#cyoFontFamily' + activeTextContainer).val();
        var quotedFont = "'" + font + "'";
        $('#cyoFontMenu li').each(function (index, element) {
            var liFont = $(element).css('font-family');
            if (liFont == quotedFont || liFont == font) {
                $(element).trigger("click");
            }
        });

        setSliderFromFontSize();
    }

    function setTextColor() {
        var hexColor = $('#cyoTextColor').spectrum("get").toHexString();
        $('#cyoTextContent' + activeTextContainer).css('color', hexColor);
        $('#cyoFontColor' + activeTextContainer).val(hexColor);
    }

    function clearTextColor() {
        $('#cyoFontColor' + activeTextContainer).val('');
    }

    // Set the font size in the text overlay based on the position
    // of the font-size slider.
    function setFontSize() {
        var sliderControl = $('#font-size-slider a');
        var position = parseInt(sliderControl.css('left'), 10);
        var fontSize = parseInt((position / 1.5), 10);
        $('#cyoTextContent' + activeTextContainer).css('font-size', fontSize);
        setFormDataForText();
    }

    // Set the position of the font-size slider based on font size in the text overlay.
    function setSliderFromFontSize() {
        var fontSize = parseInt($('#cyoFontSize' + activeTextContainer).val(), 10);
        $('#font-size-slider a').css('left', fontSize * 1.5);
    }

    // Resize the inner text container to match the dimensions of its container div
    function sizeTextContainerToDiv(divId) {
        var textContainer = $(divId).find('div');
        textContainer.attr('height', $(divId).height());
        textContainer.attr('width', $(divId).width());
    }

    // Center the selected text overlay within the binky shield.
    function centerText() {
        var activeOverlay = $('#cyoOverlayText' + activeTextContainer);
        var overlayHeight = activeOverlay.height();
        var overlayWidth = activeOverlay.width();
        var binkyDiv = $('#cyoSample');
        var binkyHeight = binkyDiv.height();
        var binkyWidth = binkyDiv.width();

        var centeredLeft = (binkyWidth - overlayWidth) / 2;
        var centeredTop = (binkyHeight - overlayHeight) / 2;
        activeOverlay.css("left", centeredLeft);
        activeOverlay.css("top", centeredTop);
        setFormDataForText();
    }

    // Sets data in the hidden form for text.
    function setFormDataForText() {
        var textOverlay = $('#cyoOverlayText' + activeTextContainer);
        $('#cyoFontSize' + activeTextContainer).val($('#cyoTextContent' + activeTextContainer).css('font-size'));
        $('#cyoTextTop' + activeTextContainer).val(textOverlay.offset().top);

        // Back end proof generator renders fonts slightly differently.
        // This usually brings us to within about 2 pixels of what the front end shows.
        var leftAdjustment = 6;
        if (textOverlay.width() >= 160)
            leftAdjustment += (textOverlay.width() - 160) / 20;
        $('#cyoTextLeft' + activeTextContainer).val(textOverlay.offset().left - leftAdjustment);

        $('#cyoTextHeight' + activeTextContainer).val(textOverlay.height());
        $('#cyoTextWidth' + activeTextContainer).val(textOverlay.width());
        setTextColor();
    }

    // Clears data in the hidden form for text.
    function clearFormDataForText() {
        $('#cyoFontSize' + activeTextContainer).val('');
        $('#cyoTextTop' + activeTextContainer).val('');
        $('#cyoTextLeft' + activeTextContainer).val('');
        $('#cyoTextHeight' + activeTextContainer).val('');
        $('#cyoTextWidth' + activeTextContainer).val('');
        clearTextColor();
    }


    // --------------------------------------------------------------------
    // FUNCTIONS FOR BINKY BACKGROUND
    // --------------------------------------------------------------------

    // Set the binky's background image. This fills the entire shield.
    function setBinkyBackground(imageUrl) {
        // Clear out any other settings that describe the binky's background.
        if ($('#cyoGraphicIsBackground').val() == 'true') {
            clearSettings('#cyoAddGraphicContainer');
            $('#cyoGraphicIsBackground').val('false');
        }
        clearSettings('#cyoSelectBackgroundContainer');
        clearSettings('#cyoUploadImageContainer');

        // Set the background image to imageUrl
        if (imageUrl != '')
            $('#cyoSample').css('background-image', 'url("' + imageUrl + '")');
        else
            $('#cyoSample').css('background-image', 'none');

        // Update our hidden inputs
        $('#cyoBgImage').val(imageUrl);
        $('#cyoSample').css('background-color', 'transparent');
        $('#cyoBgColor').val('');        

        // Special for uploaded images...
        resetBgZoomAndOffsets();
        if (bgImageWasUploadedByUser()) 
            $('#cyoSample').attr('title', 'Click and drag to reposition image');
        else 
            $('#cyoSample').attr('title', '');

        setFormDataForBinky();
    }

    // Reset zoom and offsets when setting new image or bg color
    function resetBgZoomAndOffsets() {
        // Get the size of the background image.
        var bgPercent = 100;
        var bgOffsetLeft = 0;
        var bgOffsetTop = 0;
        var binkyWidth = $('#cyoSample').width();
        var binkyHeight = $('#cyoSample').height();        
        //var bgSize = Math.max((parseFloat(uploadedImageWidth) / parseFloat(binkyWidth)), (parseFloat(uploadedImageHeight) / parseFloat(binkyHeight)));
        var bgSize = 1.0;
        if (bgImageWasUploadedByUser()) {
            if (uploadedImageWidth > binkyWidth)
                bgSize = parseFloat(uploadedImageWidth) / parseFloat(binkyWidth);
            else if (uploadedImageHeight > binkyHeight)
                bgSize = parseFloat(uploadedImageHeight) / parseFloat(binkyHeight);
            console.log("uploaded: " + uploadedImageWidth + "x" + uploadedImageHeight + ", sample: " + binkyWidth + "x" + binkyHeight + ", bgsize:" + bgSize)
            // Note that the bg images are not quite centered. 
            // Centered would be 50% / 50%, but then they appear slightly high and left.
            bgOffsetLeft = Math.max(0, Math.round((binkyWidth - uploadedImageWidth) * 0.52));
            bgOffsetTop = Math.max(0, Math.round((binkyHeight - uploadedImageHeight) * 0.52));
            bgPercent = Math.min(100, Math.round(bgSize * 50));
            $('#cyoSample').css('background-size', bgPercent + '%');
            console.log("Pct = " + bgPercent + ", Left = " + bgOffsetLeft + ", Top = " + bgOffsetTop)
            $('#cyoSample').css('background-position', bgOffsetLeft + 'px ' + bgOffsetTop + 'px');
            $('#uploadSizeSlider a').css('left', (bgPercent / 2.0) + '%');
        }
        else {
            // bg image is one of Booginhead's 
            // These have to be just slightly off center, at 52% instead of 50%
            $('#cyoSample').css('background-size', '100%');
            $('#cyoSample').css('background-position', '52% 52%');
        }
        $('#cyoBgImageZoom').val(bgPercent);
        $('#cyoBgImageOffsetX').val((bgOffsetLeft).toString());
        $('#cyoBgImageOffsetY').val((bgOffsetTop).toString());
    }


    // Returns true if the image showing on the binky shield was uploaded
    // by the user.
    function bgImageWasUploadedByUser() {
        var binkyBackground = $('#cyoSample').css('background-image');
        var uploadedImage = $('#cyoUploadedImage').val();
        return (uploadedImage.length > 0 && binkyBackground.indexOf(uploadedImage) > -1);
    }

    // Set the zoom on the uploaded background image when the user
    // changes the zoom slider. The slider is in the upload dialog.
    function setUploadImageZoom(sliderControl) {
        if (bgImageWasUploadedByUser()) {
            var zoom = parseInt(sliderControl.css('left'), 10) / 2;
            $('#cyoSample').css('background-size', zoom + '%')
            $('#cyoBgImageZoom').val(zoom);
        }
    }

    // Set the binky background color to match what's selected
    // in the background dialog.
    function setBinkyBackgroundColor() {
        $('#cyoSample').css('background-image', 'none');
        $('#cyoBgImage').val('');
        var hexColor = $('#cyoBackgroundColorControl').spectrum("get").toHexString();
        showSettings('#cyoSelectBackgroundContainer', hexColor);
        $('#cyoSample').css('background-image', 'none');
        $('#cyoSample').css('background-color', hexColor);
        $('#cyoBgColor').val(hexColor);
        resetBgZoomAndOffsets();
        return false;
    }


    // --------------------------------------------------------------------
    // MISC UTILITY FUNCTIONS
    // --------------------------------------------------------------------

    // Show the selected image/text next to the buttons on the
    // right side of the screen.
    function showSettings(divId, setting) {
        var settingDiv = $(divId).find('.cyoDisplaySetting');
        settingDiv.html(setting);
        settingDiv.show();
        $(divId).find('.ui-icon-closethick').removeClass('hidden').addClass('inline-block');
        return false;
    }

    // Clear the settings displayed next to the buttons on the right
    // side of the screen, and hide the little clickable X.
    function clearSettings(divId) {
        var settingDiv = $(divId).find('.cyoDisplaySetting');
        settingDiv.html('');
        settingDiv.hide();
        $(divId).find('.ui-icon-closethick').removeClass('inline-block').addClass('hidden');
        return false;
    }


    // Store some metadata about the binky in our hidden form.
    function setFormDataForBinky() {
        $('#cyoSampleImage').val($('#cyoBinkyLarge').attr('src'));
        $('#cyoSampleTop').val($('#cyoSample').offset().top);
        $('#cyoSampleLeft').val($('#cyoSample').offset().left);
    }

    // How many pixels per inch on this display?
    function getPixelsPerInch() {
        var div = document.createElement("div");
        div.style.width = "1in";
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(div);
        var ppi = document.defaultView.getComputedStyle(div, null).getPropertyValue('width');
        body.removeChild(div);
        return parseFloat(ppi);
    }

    // --------------------------------------------------------------------
    // BEGIN INITIALIZERS
    // --------------------------------------------------------------------

    // Initialize the file upload controller.
    // The #cyoUploadControlSettings div contains some settings 
    // in data-* attributes that were set by the server.
    function initUploader() {        
        var settings = $('#cyoUploadControlSettings');
        var previewUrl = settings.attr('data-preview-url');
        var cyoUploader = new qq.FileUploader({
            element: document.getElementById('cyoUploader'),
            action: settings.attr('data-form-action'),
            onComplete: function (id, fileName, responseJSON) {
                $("#cyoUploadFile").val(responseJSON.fileName);
                if (responseJSON.fileName) {
                    // Show a thumbnail of the uploaded image in the upload dialog.
                    $('#cyoUploadedImageThumbnail').removeAttr('width');
                    var imgUrl = previewUrl.replace('00000000-0000-0000-0000-000000000000', responseJSON.fileName);
                    $('#cyoUploadedImageThumbnail').attr('src', imgUrl);
                    $('#cyoUploadedImage').val(imgUrl);
                    $('#cyoUploadedImageDiv').show();
                    // See $('#cyoUploadedImageThumbnail').load below.
                    // That will fire around this time to set the binky background.
                }
                else if (responseJSON.message) {
                    alert(responseJSON.message);
                }
            },
            allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],
            strings: {
                upload: settings.attr('data-upload-string'),
                drop: settings.attr('data-drop-string'),
                cancel: settings.attr('data-cancel-string'),
                failed: settings.attr('data-failed-string')
            }
        });

        // This is called as soon as the image thumbnail is fully loaded.
        // We need to know the actual dimensions of the uploaded image,
        // but we want to display it at a relatively small size.
        $('#cyoUploadedImageThumbnail').load(function () {
            uploadedImageWidth = $('#cyoUploadedImageThumbnail').width();
            uploadedImageHeight = $('#cyoUploadedImageThumbnail').height();
            if (uploadedImageWidth > 200)
                $('#cyoUploadedImageThumbnail').attr('width', 200);
            else
                $('#cyoUploadedImageThumbnail').attr('width', uploadedImageWidth);
            showUploadAsBackground($('#cyoUploadedImageThumbnail').attr('src'));
        });


        // Remove this div. If the user drags anywhere in the upload dialog,
        // that will cause the uploader to display a div that says 
        // "Drop files here to upload". By the time the user is dragging, 
        // he/she has already uploaded an image and is trying to work with
        // the slider. The appearance of this new div is disconcerting in 
        // that context.
        $('.qq-upload-drop-area').remove();

        // Clear uploaded image when user clicks X
        $('#cyoUploadImageContainer .ui-icon-closethick').click(function () {
            clearUploadedImage();
        });

        // If user clicks on the uploaded image thumbnail, 
        // load the image back into the overlay. This is 
        // useful when user deletes uploaded image then
        // wants it back
        $('#cyoUploadedImageThumbnail').click(function () {
            var imgUrl = $('#cyoUploadedImageThumbnail').attr('src');
            showUploadAsBackground(imgUrl);
        });
    }


    // Initalize the modal dialogs and hook up the buttons that launch them.
    function initModals() {
        var modalProperties = {
            height: 460,
            width: 500,
            modal: false,
            autoOpen: false,
            position: { my: "left", at: "center", of: window },
            show: { effect: "blind", duration: 600 },
            buttons: {
                "OK": function () {
                    $(this).dialog("close");
                }
            }
        };

        $("#cyoModalBackground").dialog(modalProperties);
        $("#cyoModalText").dialog(modalProperties);
        $("#cyoModalGraphic").dialog(modalProperties);

        var uploadModalProperties = modalProperties;
        uploadModalProperties.height += 100;
        $("#cyoModalUpload").dialog(uploadModalProperties);

        var proofModalProperties = modalProperties;
        proofModalProperties.height += 100;
        proofModalProperties.width += 150;
        proofModalProperties.position = { at: "center", of: window }
        proofModalProperties.open = function (event, ui) {
            // Make user explicitly approve each proof
            var proofUrl = $('#cyoProofImageContainer img').attr("src");
            var uuid = extractUUID(proofUrl);
            if ($("#cyoApprovedImages").val().indexOf(uuid) < 0) {
                $('.js-approval-checkbox').prop("checked", false);
                unsetCartParams(); // Item is not approved so user cannot add to cart.
            }
            else {
                $('.js-approval-checkbox').prop("checked", true);
                setCartParams(proofUrl);
            }
        }
        $("#cyoModalProof").dialog(modalProperties);

        // The most-recently approved proof has its UUID set in the
        // attribute field of the shopping cart, and its image shows
        // next to the "Add to Cart" button, so the user knows which
        // design they are adding.
        $(".js-approval-checkbox").change(function () {
            var proofUrl = $('#cyoProofImageContainer img').attr("src");
            var uuid = extractUUID(proofUrl);
            var approvedProofs = $("#cyoApprovedImages").val();
            if ($("#cyoApproveProof").prop("checked") && $("#cyoProofNotCopyrighted").prop("checked")) {
                if ($("#cyoApprovedImages").val().indexOf(uuid) < 0)
                    approvedProofs += '(' + uuid + ')';
                setCartParams(proofUrl);
            }
            else {
                // 0 or 1 items checked. Design is not approved
                approvedProofs = approvedProofs.replace('(' + uuid + ')', '');
                unsetCartParams();
            }
            $("#cyoApprovedImages").val(approvedProofs);
        });

        $('#btnShowModalUpload').click(function () {
            $("#cyoModalUpload").dialog("open");            
        });

        $('#btnShowModalBackground').click(function () {
            $("#cyoModalBackground").dialog("open");
        });

        $('#btnShowModalText1').click(function () {
            activeTextContainer = 1;
            loadTextSettings();
            $("#cyoOverlayText1").show();
            $("#cyoModalText").dialog("open");
        });
        $('#btnShowModalText2').click(function () {
            activeTextContainer = 2;
            loadTextSettings();
            $("#cyoOverlayText2").show();
            $("#cyoModalText").dialog("open");
        });

        $('#btnShowModalGraphic').click(function () {
            $("#cyoModalGraphic").dialog("open");
        });
    }

    // Initialize some jQuery elements. 
    function initDraggablesAndSliders() {

        // This displays the overlay graphic
        $("#cyoOverlayStockImage").draggable({
            drag: function (e, ui) {
                setFormDataForGraphic();
            }
        }).resizable({
            resize: function (e, ui) {
                sizeImageToDiv("#cyoOverlayStockImage");
            },
            handles: "se"
        });        

        // This displays the first line of text.
        $("#cyoOverlayText1").draggable({
            drag: function (e, ui) {
                setFormDataForText();
            }
        });

        // This displays the second line of text.
        $("#cyoOverlayText2").draggable({
            drag: function (e, ui) {
                setFormDataForText();
            }
        });

        // Stop propagation of the mousedown event on the draggable
        // overlays. If we don't do this, dragging the overlay also
        // drags the underlying background image.
        $("#cyoOverlayStockImage").on("mousedown", function (e) { e.stopPropagation(); return false; });
        $("#cyoOverlayText1").on("mousedown", function (e) { e.stopPropagation(); return false; });
        $("#cyoOverlayText2").on("mousedown", function (e) { e.stopPropagation(); return false; });


        // Initialize the sliders. Position for font-size-slider is set 
        // when text controls are initialized. That should be done here. (Someday)
        $("#font-size-slider").slider({ slide: setFontSize });
        $("#uploadSizeSlider").slider();
        $("#uploadSizeSlider a").css("left", DEFAULT_ZOOM_SLIDER_POSITION);
    }

    function initBackgroundImageBehaviors() {
        // Load clicked background image into pacifier
        $('#cyoModalBackground .chooser img').click(function () {
            var url = $(this).attr('src');
            setBinkyBackground(url.replace(/_thumb/, ''));
            setZoomForStockImage();
            showSettings('#cyoSelectBackgroundContainer', $(this).attr('title'));
            return false;
        });

        // Clear the background image from the pacifier when user clicks X
        $('#cyoSelectBackgroundContainer .ui-icon-closethick').click(function () {
            $('#cyoSample').css('background-image', 'none');
            $('#cyoBgImage').val('');
            clearSettings('#cyoSelectBackgroundContainer');
            return false;
        });

        // Set up the colorpicker.
        // The move event here is not mousemove. It's fired
        // when you move the black dot on the color picker
        // by clicking in a new location or by dragging the dot.
        $('#cyoBackgroundColorControl').spectrum({
            allowEmpty: true,
            clickoutFiresChange: true,
            color: "#fff",
            move: setBinkyBackgroundColor,
            showPalette: true
        });

        $('#cyoBackgroundColorControl').change(function () {
            setBinkyBackgroundColor();
        });

        // When user clicks color wheel, focus color input so pop-up colorpicker appears.
        $('#cyoBgColorWheel').click(function () {
            $('#cyoBackgroundColorControl').trigger('focus');
            return false;
        });

    }

    function initStockImageBehaviors() {
        // Load clicked stock image into div on top of pacifier
        $('#cyoModalGraphic .chooser img').click(function () {
            $('#cyoModalGraphic .chooser img').removeClass("selected");
            $(this).addClass("selected");
            var url = $(this).attr('src');
            // Full background image... No longer used. Full images have been
            // moved up to the background image dialog.
            if ($(this).attr('data-fill-background') == 'true') {
                setBinkyBackground(url.replace(/_thumb/, '').replace(".jpg", ".png"));
                $('#cyoOverlayStockImage .cyoImgContainer').empty();
                $('#cyoGraphicIsBackground').val('true');
                setZoomForStockImage();
            }
            else {  // Smaller image goes on overlay
                var img = '<img src=\"' + url.replace(/_thumb/, '').replace(".jpg", ".png") + '\" height=\"222">';
                $('#cyoOverlayStockImage .cyoImgContainer').html(img);
                //$(img).height($(this).height());
                //$(img).width($(this).width());
                $('#cyoOverlayStockImage').show();
                if ($('#cyoGraphicIsBackground').val() == 'true')
                    $('#cyoSample').css('background-image', 'none');
                $('#cyoGraphicIsBackground').val('false');
            }
            setFormDataForGraphic();
            showSettings('#cyoAddGraphicContainer', $(this).attr('title'));
            return false;
        });

        // Clear stock image when user clicks X
        $('#cyoAddGraphicContainer .ui-icon-closethick').click(function () {
            clearStockImage();
        });
    }


    function initTextDialogBehaviors() {
        // Custom font menu
        $('#cyoFontMenu li').click(function () {
            $('#cyoFontMenu li').removeClass('selected');
            $(this).addClass('selected');
            var font = $(this).css('font-family');
            $('#cyoCustomFont').attr('value', font);
            $('#cyoTextContent' + activeTextContainer).css('font-family', font);
            $('#cyoFontFamily' + activeTextContainer).val(font.replace(/'/g, ''));
        });

        // Allow font color input to set font color in overlay
        $('#cyoTextColor').spectrum({
            allowEmpty: true,
            clickoutFiresChange: true,
            color: "#000",
            move: setTextColor,
            showPalette: true
        });

        $('#uploadSizeSlider a').mouseup(function () {
            setUploadImageZoom($(this));
        });

        // Set custom text as user types
        $('#cyoCustomText').keyup(function () {
            var text = $(this).val().replace(/\n/g, "<br/>");
            $('#cyoTextContent' + activeTextContainer).html(text);
            $('#cyoText' + activeTextContainer).val(text);
            showSettings('#cyoAddTextContainer' + activeTextContainer, text);
            setFormDataForText();
        });

        $('#btnCenterText').click(centerText);

        // Initialize font size slider position and font size
        $('#font-size-slider a').css('left', '80px');
        setFontSize();

        // Clear text when user clicks X
        $('#cyoAddTextContainer1 .ui-icon-closethick, #cyoAddTextContainer2 .ui-icon-closethick').click(function () {
            if ($(this).parent().attr('id') == 'cyoAddTextContainer1') {
                activeTextContainer = 1;
                $('#cyoOverlayText1').hide();
            }
            else {
                activeTextContainer = 2;
                $('#cyoOverlayText2').hide();
            }
            clearText();
            clearFormDataForText();
            return false;
        });
    }



    function initRadios() {
        // Copy product size to hidden form when user changes it
        $('input[name=size]').change(function () {
            $('#cyoProductSize').val($(this).val());
        });

        // Select & display binky brand
        $('input[name=brand]').change(function () {
            var brand = $(this).val();
            $('#cyoBrand').val($(this).val());
            if (brand == 'booginhead') {
                $('#binkiesNuk').hide();
                $('#binkiesBooginhead').show();
            }
            else {
                $('#binkiesBooginhead').hide();
                $('#binkiesNuk').show();
            }
        });
    }


    function initBinkySelector() {
        // When user clicks white/pink/blue binky, load that image into the customizer on the left
        $('.shields img').click(function () {
            var bgImage = $('#cyoSample').css('background-image');
            $('#cyoBinkyLarge').attr('src', $(this).attr('data-large-image'));
            $('#cyoSample').css('background-image', bgImage);
            // Copy product color to hidden form
            $('#cyoProductColor').val($(this).attr('data-shield'));
            $('#cyoSampleImage').val($('#cyoBinkyLarge').attr('src'));
            // Highlight selected binky and remove highlight from others
            $('.shields .selected').removeClass('selected');
            $(this).addClass('selected');
        });
    }


    function initCreateProof() {
        // Create Proof button
        $('#btn-create-proof').click(function () {
            var form = $('#cyoProductSize').parent();
            form.submit();
        });
    }


    function initOverlays() {
        // If the user clicks on an element, make that element
        // the "selected" element. Make sure any previously selected
        // elements are no longer selected.

        $('#cyoOverlayStockImage, #cyoOverlayText1, #cyoOverlayText2').click(function () {
            $('.selected-overlay').removeClass('selected-overlay');
            var elementId = $(this).attr('id');
            if (elementId == 'cyoOverlayText1') {
                activeTextContainer = 1;
                loadTextSettings();
                $("#cyoModalText").dialog("open");
            }
            else if (elementId == 'cyoOverlayText2') {
                activeTextContainer = 2;
                loadTextSettings();
                $("#cyoModalText").dialog("open");
            }
            $(this).addClass('selected-overlay');
            return false;
        });


        // This is too jumpy because events keep firing.
        //$('#cyoProductContainer').mouseover(function () {
        //    $(this).css("z-index", "0");
        //});
        //$('#cyoProductContainer').mouseout(function () {
        //    $(this).css("z-index", "50");
        //});
    }

    // Initialize document-wide click and key behaviors
    function initDocumentBehaviors() {

        // When clicking on the body, outside of one of our overlays,
        // de-select any overlay that might be selected.
        $('body').click(function () {
            $('.selected-overlay').removeClass('selected-overlay');
        });

        // Catch the keyup event for the delete key. If one of the overlays
        // is selected when user hits delete, empty that element and hide it.
        $(document).keyup(function (event) {
            var selectedOverlay = $('.selected-overlay')[0];
            if (selectedOverlay != null && (event.which == DELETE || event.which == BACKSPACE)) {
                if ($(selectedOverlay).attr('id') == 'cyoOverlayStockImage') {
                    clearStockImage();
                    $('#cyoOverlayStockImage').removeClass('selected-overlay');
                }
                else if ($(selectedOverlay).attr('id') == 'cyoOverlayText1') {
                    clearText();
                    $('#cyoOverlayText1').removeClass('selected-overlay');
                    $('#cyoOverlayText1').hide();
                    clearFormDataForText();
                }
                else if ($(selectedOverlay).attr('id') == 'cyoOverlayText2') {
                    clearText();
                    $('#cyoOverlayText2').removeClass('selected-overlay');
                    $('#cyoOverlayText2').hide();
                    clearFormDataForText();
                }                
                event.stopPropagation();
            }
        });
    }

    // This function figures out the position of the background image behind
    // the pacifier. If user uploaded this image, they can drag the image to 
    // center it. The problem is that the initial background position is 
    // set to a percentage value, and we have to translate that to a pixel
    // value. Once the image has been dragged, bg position has a pixel value.
    function bgPositionOfUploadedImage() {
        var container = $('#cyoSample');
        var pos = container.css('background-position').match(/(-?\d+).*?\s(-?\d+)/);
        if (pos[0].indexOf('px') > -1)
            return [parseInt(pos[1]), parseInt(pos[2])];
        // Else background position is specified as percentage.
        var xPercent = parseInt(pos[1]) / 100;
        var yPercent = parseInt(pos[2]) / 100;
        var xCoord = (container.width() - uploadedImageWidth) * yPercent;
        var yCoord = (container.height() - uploadedImageHeight) * xPercent;
        return [xCoord < 0 ? 0 : xCoord, yCoord < 0 ? 0 : yCoord];
    }

    // Allow user to reposition the background image they uploaded. 
    // Adapted from https://github.com/kentor/jquery-draggable-background
    function initDraggableBackground() {
        $('#cyoSample').on('mousedown touchstart', function (e) {
            // Do not make bg image draggable unless image was uploaded by user.
            // The stock Booginhead images are correctly placed by default.
            if (bgImageWasUploadedByUser() == false) {
                return false;
            }
            e.preventDefault();
            if (e.originalEvent.touches) {
                e.clientX = e.originalEvent.touches[0].clientX;
                e.clientY = e.originalEvent.touches[0].clientY;
            }
            else if (e.which !== 1) {
                return;
            }
            var x0 = e.clientX
              , y0 = e.clientY
              , pos = bgPositionOfUploadedImage()
              , xPos = parseInt(pos[0]) || 0
              , yPos = parseInt(pos[1]) || 0
            console.log(pos)
            $(window).on('mousemove touchmove', function (e) {
                e.preventDefault();
                if (e.originalEvent.touches) {
                    e.clientX = e.originalEvent.touches[0].clientX;
                    e.clientY = e.originalEvent.touches[0].clientY;
                }
                var x = e.clientX
                  , y = e.clientY
                xPos = xPos + x - x0;
                yPos = yPos + y - y0;
                x0 = x;
                y0 = y;
                $('#cyoSample').css('background-position', xPos + 'px ' + yPos + 'px');
                $('#cyoBgImageOffsetX').val(xPos);
                $('#cyoBgImageOffsetY').val(yPos);
            });
        });
        $(window).on('mouseup touchend', function () { $(window).off('mousemove touchmove') });
    }

    function initHiddenForm() {
        setFormDataForBinky();
        var ppi = 0;
        try { ppi = getPixelsPerInch(); }
        catch (ex) {}
        $('#cyoPixelsPerInch').val(ppi);
    }


    function getCookieByName(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    // Get the data associated with the recent design. If the user
    // decides they want to buy this design, we need to know the
    // size, color, brand, etc. This data goes into the cart.
    function getDataForRecentDesign(jsonUrl, imageUrl) {
        $.get(jsonUrl, function (data) {
            recentDesignData[imageUrl] = data;
        });
    }

    // Update the recent design images in the lower left corner of the page.
    function updateRecentDesigns() {
        var cookie = getCookieByName("CYORecentDesigns");
        if (cookie != null) {
            var urls = cookie.split('|');
            var html = '<h2 class="cyo-h2">Recent Designs</h2>';
            for (var i = 0; i < urls.length; i++) {
                html += '<img src="' + urls[i] + '" width="150" />';
                var jsonUrl = urls[i].replace(".png", ".json");
                getDataForRecentDesign(jsonUrl, urls[i]);
            }
            $("#cyoRecentDesigns").html(html);
            $("#cyoRecentDesigns img").click(function () {
                var imageTag = "<img src='" + $(this).attr('src') + "'>";
                $('#cyoProofImageContainer').html(imageTag);
                $('#cyoProofErrorMessage').html('');
                $('#cyoDefaultProofMessage').show();
                $("#cyoModalProof").dialog("open");
            });
        }
    }

    // Returns the first UUID in string str
    function extractUUID(str) {
        if (str != null) {
            var matches = str.match(UUID_REGEX)
            if (matches && matches.length > 0)
                return matches[0];
        }
        return null;
    }


    function setAttributesForCart(proofUrl) {
        var uuid = extractUUID(proofUrl);
        var brand, color, size;
        if (recentDesignData[proofUrl]) {
            // Item is a recent design
            var data = recentDesignData[proofUrl];
            brand = data.Brand;
            color = data.ProductColor;
            size = data.ProductSize;
        }
        else {
            // Item is the proof they just made
            brand = $('#cyoProductBrand').val();
            color = $('#cyoProductColor').val();
            size = $('#cyoProductSize').val();
        }
        $('#product-details-form input[data-cyo="CYO Unique Id"]').val(uuid);
        $('#product-details-form input[data-cyo="CYO Brand"]').val(brand);
        $('#product-details-form input[data-cyo="CYO Color"]').val(color);
        $('#product-details-form input[data-cyo="CYO Size"]').val(size);
    }

    function clearAttributesForCart() {
        $('#product-details-form input[data-cyo="CYO Unique Id"]').val('');
        $('#product-details-form input[data-cyo="CYO Brand"]').val('');
        $('#product-details-form input[data-cyo="CYO Color"]').val('');
        $('#product-details-form input[data-cyo="CYO Size"]').val('');
    }

    function setImageForCart(proofUrl) {
        $('#cyoDesignForCart').attr('src', proofUrl);
    }

    // Happens when user approves a proof
    function setCartParams(proofUrl) {
        setAttributesForCart(proofUrl);
        setImageForCart(proofUrl);
        $('#cyoNotYetApproved').hide();
        $('#cyoApproved').show();
        enableAddToCart();
    }

    // Happens when user unapproves a proof
    function unsetCartParams(proofUrl) {
        clearAttributesForCart();
        setImageForCart("");
        $('#cyoNotYetApproved').show();
        $('#cyoApproved').hide();
        disableAddToCart();
    }

    // User cannot add CYO to cart until they approve the proof
    function disableAddToCart() {
        if (originalButtonBackground == null)
            originalButtonBackground = $('#product-details-form input[type=button]').css('background');
        $('#product-details-form input[type=button]').css('background', '#999');
        $('#product-details-form input[type=button]').attr('disabled', 'disabled');
    }

    // When proof is approved, enable add-to-cart.
    function enableAddToCart() {
        $('#product-details-form input[type=button]').css('background', originalButtonBackground);
        $('#product-details-form input[type=button]').removeAttr('disabled');
    }

    // Callback for submitting proof form
    window.cyoProofOnComplete = function (response) {
        var responseData = JSON.parse(response.responseText);
        var imageTag = "<img src='" + responseData.proofUrl + "'>";
        $('#cyoProofImageContainer').html(imageTag);
        if (responseData.errorMessage) {
            $('#cyoProofErrorMessage').html(responseData.errorMessage);
            $('#cyoDefaultProofMessage').hide();
        }
        else {
            $('#cyoProofErrorMessage').html('');
            $('#cyoDefaultProofMessage').show();
            updateRecentDesigns();
        }
        $("#cyoModalProof").dialog("open");
    }


    function initUI() {
        disableAddToCart();
        initUploader();
        initModals();
        initDraggablesAndSliders();
        initBackgroundImageBehaviors();
        initStockImageBehaviors();
        initTextDialogBehaviors();
        initRadios();
        initBinkySelector();
        initCreateProof();
        initOverlays();
        initDraggableBackground();
        initHiddenForm();
        initDocumentBehaviors();
        updateRecentDesigns();
    }

});
