const parallaxHeader = document.getElementById("parallax-header");
const parallaxContent = document.querySelector("#parallax-content section");

window.onscroll = function() {
    parallaxHeader.style.height = `calc(100vh - ${document.documentElement.scrollTop}px)`
    // parallaxContent.style.top = `${document.documentElement.scrollTop}px`
}