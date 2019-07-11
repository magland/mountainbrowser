import React from "react";
import ReactDOM from "react-dom";
import { MTBrowser } from "./widgets";

const show_mtbrowser = async (path) => {
    ReactDOM.render(
        <div>
            <MTBrowser path={path}></MTBrowser>
        </div>,
        document.getElementById("root")
    );
};

const show_default_mtbrowser = async () => {
    // in future use key path here
    // const gallery_path = 'sha1dir://b950b6a3ec81d481b8c19b03a23e9a5747c71b38.gallery';
    const gallery_path = 'key://pairio/spikeforest/gallery';
    await show_mtbrowser(gallery_path);
}

window.show_mtbrowser = show_mtbrowser;
window.show_default_mtbrowser = show_default_mtbrowser;
