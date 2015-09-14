function loadPortletContent(id, title, useQueue) {
    var postParams = {
        url: "cf_elements/elementremote.cfc",
        cache: false,
        data: {
            method: "buildElement",
            id: id,
            firstLoad: false,
            inUnpublished: !!(window.topframe && window.topframe.unpublished)
        },
        type: "post",
        dataType: "html",
        success: function(data, textStatus) {
                var $temp = $j(data), $linkColor = $temp.find(".data_fs_link_color");
                if ($linkColor.length) {
                    $temp.find(".portlet_content a").css("color", $linkColor.text())
                }
                $j("#c_" + id).html($temp)
        },
        error: function(e, textStatus) {
            if (!(textStatus == "error" && e.status == 0)) {
                $j.jGrowl("There was an error loading " + title + ".")
            }
        }
    };
    if (id > 0) {
        if (!useQueue) {
            $j.ajax(postParams)
        } else {
            $j("#e_" + id).parent().ajaxQueue(postParams)
        }
    } else {
        $j.jGrowl("You are trying to load an invalid element")
    }
}