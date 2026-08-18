/*  
//   nemeo slider v0.3
//   by ukrounay, 2023
*/  


class nemeo_slider {

    constructor(name, body, slides, currentSlide, previousButton, nextButton, indicators, indicatorsContainer, numberIndicator, infinite, x, previousX, marginX, busy, dragging, finishTimer) {
        this.name = name;
        this.body = body;
        this.slides = slides;
        this.currentSlide = currentSlide;
        this.previousButton = previousButton;
        this.nextButton = nextButton;
        this.indicatorsContainer = indicatorsContainer;
        this.indicators = indicators;
        this.numberIndicator = numberIndicator;
        this.infinite = infinite;
        this.x = x;
        this.previousX = previousX;
        this.marginX = marginX;
        this.busy = busy;
        this.dragging = dragging;
        this.finishTimer = finishTimer;
    }

    moveInit(currentX) {
        if (this.busy) {
            this.busy = false;
            this.body.style.transition = "none";
            clearTimeout(this.finishTimer);
        }
        this.previousX = currentX;
        this.dragging = true;
        this.moving(currentX);
    }
    
    moving(currentX) {
        if (this.dragging) {
            let frameWidth = this.body.getBoundingClientRect().width/this.slides.length;
            this.marginX = currentX - this.previousX;
            if (this.x && this.x > 0 && -frameWidth*this.currentSlide + this.x > 0 && this.marginX > 0) {
                console.log("left");
                this.x = this.x + ((Math.abs(this.marginX) * (frameWidth - this.x)) / (frameWidth * 2));
            } else 
            if(this.x && this.x < 0 && this.currentSlide + Math.ceil(this.x / frameWidth) >= (this.slides.length - 1) && this.marginX < 0) {
                console.log("right");
                this.x = this.x - ((Math.abs(this.marginX) * (frameWidth - this.x)) / (frameWidth * 2));
            } else
            if (this.x) this.x += this.marginX; else this.x = this.marginX;
            this.body.style.left = -frameWidth*this.currentSlide + this.x + "px";
        }
        this.previousX = currentX;
    }
    
    
    autofinish() {
        if(this.dragging) {
            this.dragging = false;
            let frameWidth = this.body.getBoundingClientRect().width/this.slides.length;
            let framesScrolled = -Math.round(this.x/frameWidth);
            this.currentSlide += framesScrolled;
            if (framesScrolled == 0) {
                if (this.x >= 50) this.currentSlide--;
                if (this.x <= -50) this.currentSlide++;
            }
            if (this.currentSlide < 0) this.currentSlide = 0;
            if (this.currentSlide >= this.slides.length) this.currentSlide = this.slides.length - 1;
            this.toSlide(this.currentSlide);
        }
    }
    
    toSlide(slide) {
        if (slide >= 0 && slide < this.slides.length) {
            this.busy = true;
            this.x = 0;
            this.marginX = 0;
            this.previousX = 0;
            this.currentSlide = slide;
            this.numberIndicator.innerHTML = slide + 1 + " / " + this.slides.length;
            if (slide == 0) this.previousButton.classList.add("unavialable"); else this.previousButton.classList.remove("unavialable");
            if (slide == this.slides.length - 1) this.nextButton.classList.add("unavialable"); else this.nextButton.classList.remove("unavialable");
            this.indicators.forEach(indicator => {indicator.classList.remove("active")});
            this.indicators[slide].classList.add("active");
            this.indicatorsContainer.scrollTo(
                {
                    left: this.indicators[slide].getBoundingClientRect().left + this.indicatorsContainer.scrollLeft - this.indicatorsContainer.clientWidth / 2 - this.indicators[slide].clientWidth * 2, 
                    behavior: "smooth"
                }
            );
            this.body.style.transition = "300ms";
            this.body.style.left = -slide*100 + "%";
            this.finishTimer = setTimeout(()=>{
                this.body.style.transition = "none";
                this.busy = false;
                clearTimeout(this.finishTimer);
            },310);
        }
    }
    nextSlide() {
        this.toSlide(this.currentSlide + 1);
    }
    previousSlide() {
        this.toSlide(this.currentSlide - 1);
    }

}

let sliders = [];

window.addEventListener("load", () => {
    let htmlSliders = document.getElementsByClassName("nemeo-slider");
    for (let i = 0; i < htmlSliders.length; i++) {
        initializeSlider(htmlSliders[i])
    }
    console.log("sliders initialized", sliders);
});


function initializeSlider(htmlSlider) {
    let slider = new nemeo_slider({name: "nemeo-slider-" + sliders.length});

    htmlSlider.id = slider.name;
    // {
    //     <span class="number-indicator"></span>
    //     <a class="previous-btn unavialable"><i class="ni-angle-left"></i></a>
    //     <div class="slider-content ratio c21-9">
    //         <div class="slider-body"></div>
    //     </div>
    //     <a class="next-btn"><i class="ni-angle-right"></i></a>

    // }

    
    let htmlSliderContent = htmlSlider.querySelector(".slider-content");
    if(htmlSliderContent == undefined || htmlSliderContent == null) {
        let sliderContent = document.createElement("div");
        sliderContent.classList = "slider-content ratio c16-9";
        htmlSlider.appendChild(sliderContent);
    }
    
    slider.body = htmlSlider.querySelector(".slider-body");
    if(slider.body == undefined || slider.body == null) {
        let sliderBody = document.createElement("div");
        sliderBody.classList = "slider-body";
        htmlSlider.querySelector(".slider-content").appendChild(sliderBody);
        slider.body = htmlSlider.querySelector(".slider-body");
    }

    
    let indicatorsContainer = document.createElement("div");
    indicatorsContainer.classList = "indicators-container";
    htmlSlider.appendChild(indicatorsContainer);
    slider.indicatorsContainer = htmlSlider.querySelector(".indicators-container");

    slider.slides = htmlSlider.dataset.sources.split(",");

    for (let j = 0; j < slider.slides.length; j++) {
        let slideType = slider.slides[j].trim().split(":")[0].trim();
        let slideData = slider.slides[j].trim().split(":")[1].trim();

        let slideContainer = document.createElement("div");
        slideContainer.classList.add("slide-container");
        let slide = document.createElement("div");
        slide.classList.add("slide");

        switch (slideType) {
            case "image":
                slide.style.backgroundImage = `url(${slideData})`
                let slideBg = document.createElement("div");
                slideBg.classList.add("slide-bg");
                slideBg.style.backgroundImage = `url(${slideData})`;
                slideContainer.appendChild(slideBg);
                break;
            case "id":
                slide.append(document.getElementById(slideData));
                break;
            default:
                slide.innerHTML = `unsupported content`;
                break;
        }
        slideContainer.appendChild(slide);
        slider.body.appendChild(slideContainer);

        let indicator = document.createElement("span");
        indicator.classList.add("indicator");
        indicator.setAttribute("onclick", `sliders[${sliders.length}].toSlide(${j})`)
        htmlSlider.querySelector(".indicators-container").appendChild(indicator);
    }

    slider.slides = htmlSlider.querySelectorAll(".slide");

    slider.body.style.width = slider.slides.length * 100 + "%";

    slider.currentSlide = 0;

    slider.previousButton = htmlSlider.querySelector(".previous-btn");
    if(slider.previousButton == undefined || slider.previousButton == null) {
        let pBtn = document.createElement("a");
        pBtn.classList = "previous-btn unavialable";
        pBtn.innerHTML = `<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23.53 34.42"><polygon points="23.53 6.32 17.21 0 6.32 10.89 0 17.21 6.32 23.53 6.32 23.53 17.21 34.42 23.53 28.1 12.63 17.21 23.53 6.32"/></svg>`;
        htmlSlider.appendChild(pBtn);
        slider.previousButton = htmlSlider.querySelector(".previous-btn");
    }
    slider.previousButton.href = `javascript:sliders[${sliders.length}].previousSlide()`
    

    slider.nextButton = htmlSlider.querySelector(".next-btn");
    if(slider.nextButton == undefined || slider.nextButton == null) {
        let nBtn = document.createElement("a");
        nBtn.classList = "next-btn";
        nBtn.innerHTML = `<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23.53 34.42"><polygon points="17.21 10.89 6.32 0 0 6.32 10.89 17.21 0 28.1 6.32 34.42 17.21 23.53 23.53 17.21 17.21 10.89"/></svg>`;
        htmlSlider.appendChild(nBtn);
        slider.nextButton = htmlSlider.querySelector(".next-btn");
    }
    slider.nextButton.href = `javascript:sliders[${sliders.length}].nextSlide()`

    slider.indicators = htmlSlider.querySelectorAll(".indicator");
    slider.indicators[slider.currentSlide].classList.add("active");

    slider.numberIndicator = htmlSlider.querySelector(".number-indicator");
    if(slider.numberIndicator == undefined || slider.numberIndicator == null) {
        ni = document.createElement("span");
        ni.classList = "number-indicator";
        indicatorsContainer.appendChild(ni);
        slider.numberIndicator = htmlSlider.querySelector(".number-indicator");
    }
    slider.numberIndicator.innerHTML = slider.currentSlide + 1 + " / " + slider.slides.length;

    slider.x = 0;
    slider.previousX = 0;
    slider.marginX = 0;
    slider.busy = false;
    slider.dragging = false;
    slider.finishTimer = undefined;

    slider.body.addEventListener('mousedown', (e) => {slider.moveInit(e.clientX)});
    slider.body.addEventListener('touchstart', (e) => {slider.moveInit(e.changedTouches[0].pageX)});

    document.addEventListener('mousemove', (e) => {slider.moving(e.clientX)});
    document.addEventListener('touchmove', (e) => {slider.moving(e.changedTouches[0].pageX)});

    document.addEventListener('mouseup', () => {slider.autofinish();});
    document.addEventListener('touchend', () => {slider.autofinish();});
    document.addEventListener('touchcancel', () => {slider.autofinish();});

    sliders.push(slider);
}
