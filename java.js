/**
* Simple Encapsulation Class template
*/
(function (root) {

    "use strict";

    /**
     * Common object params
     * @type {Object}
     */
    var common = {
            publicMethods: ['next', 'prev', 'goTo', 'setOptions', 'play', 'stop', 'getEffectsList', 'setEffect'],
            className: 'JsCarousel'
        },

        /**
         * Main constructor
         * @return {Object} - this handle
         */
        Protected = function (handle, options) {

            //main settings
            this.settings = {
                effect: 'carousel',
                timeFunction: 'easeOutQuart',
                easeInOut: true,
                duration: 1000,
                autoplay: false,
                autoplayTimeout: 1000,
                bullets: true,
                controls: true,
                onload: null
                /*,stopOnHover: true*/
            };

            //main handle
            this.handle = handle;

            this.handle.classList.add('js-carousel');

            //items array
            this.items = this.handle.children;

            //set options
            this.setOptions(options);
           
            this.preloadImages(function () {
                this.init();
            });
         

            return this;
        };


    /**
     * Main prototype
     * @type {Object}
     */
    Protected.prototype = {

        preloadImages: function (callback) {
            
            var self = this,
                images,
                preloadFn,
                counter,
                l,
                i;

            images = this.handle.querySelectorAll('img');

            if (images) {

                l = images.length;
                counter = l;

                preloadFn = function (imgElem) {
                    var img = document.createElement('img');
                    img.onload = function () {
                        counter -= 1;
                        if (counter === 0) {
                            callback.call(self);
                        }
                    };
                    img.src = imgElem.src;
                    img = null;
                };

                for (i = 0; i < l; i += 1) {
                    preloadFn(images[i]);
                }
            }
        },

        init: function () {

            var self = this;





            //create wrapper
            this.wrapper = document.createElement('div'); 
            this.wrapper.setAttribute('class', 'js-carousel-wrapper');

            //create main container
            this.container = document.createElement('div'); 
            this.container.setAttribute('class', 'js-carousel-container');

            //insert container before handle
            this.handle.parentNode.insertBefore(this.container, this.handle.parentNode.firstChild);


            //create effect container
            this.effectContainer = document.createElement('div');
            this.effectContainer.setAttribute('class', 'effect-container');
            this.container.appendChild(this.effectContainer);

            //create handle wrapper
            this.wrapper = document.createElement('div'); 
            this.wrapper.setAttribute('class', 'js-carousel-wrapper');
            this.container.appendChild(this.wrapper);

            // create nav container
            
            if (this.settings.controls) {

                this.navContainer = document.createElement('div');
                this.navContainer.setAttribute('class', 'js-carousel-nav-container');

                // crate prev button
                this.prevButton = document.createElement('div');
                this.prevButton.setAttribute('class', 'js-carousel-prev-button');
                
                // create next button
                this.nextButton = document.createElement('div');
                this.nextButton.setAttribute('class', 'js-carousel-next-button');
                
                // put buttons into nav container
                this.navContainer.appendChild(this.prevButton);
                this.navContainer.appendChild(this.nextButton);

                // put nav container into main container
                this.container.appendChild(this.navContainer);
            }












            //put handle into the wrapper
            this.wrapper.appendChild(this.handle);



            //set current slide number
            this.currentSlide = 1;

            //in action status flag
            this.inaction = true;

            //abort status flag
            this.abortStatus = false;



            //set events to prev button
            this.settings.controls && this.prevButton.addEventListener('click', (this.prev).bind(this));

            //set events to next button
            this.settings.controls && this.nextButton.addEventListener('click', (this.next).bind(this));

            //autoplay timer ID
            this.autoplayTimeoutId = null;










            this.itemWidth = this.items[0].querySelector('img').clientWidth;

            this.itemHeight = this.items[0].querySelector('img').clientHeight;

            Array.prototype.forEach.call(this.items, function (item) {
                self.applyStyles(item, {
                    width: self.itemWidth + 'px',
                    height: self.itemHeight + 'px'
                });
            });

            //clone last slide to first
            this.handle.insertBefore(this.items[this.items.length - 1].cloneNode(true), this.handle.firstChild);

            //clone first slide to last
            this.handle.appendChild(this.items[1].cloneNode(true));

            //set carousel full width
            this.handle.style.width = (this.itemWidth * this.items.length) + 'px';

            //set carousel start left position
            this.handle.style.left = -this.itemWidth + 'px';

            //set styles to main container
            this.applyStyles(this.container, {
                width: this.itemWidth + 'px',
                height: this.itemHeight + 'px',
                position: 'relative'
            });

            //set styles to wrapper
            this.applyStyles(this.wrapper, {
                width: this.itemWidth + 'px',
                height: this.itemHeight + 'px',
                position: 'relative',
                overflow: 'hidden'
            });

            //set styles to effect container
            this.applyStyles(this.effectContainer, {
                width: this.itemWidth + 'px',
                height: this.itemHeight + 'px',
                position: 'absolute',
                overflow: 'hidden',
                left: 0,
                top: 0,
                zIndex: 1,
                display: 'none'
            });



            if (this.settings.bullets) {
                
                // create bullets wrapper
                this.bulletsWrapper = document.createElement('div');
                this.bulletsWrapper.setAttribute('class', 'js-carousel-bullets-wrapper');

                // create bullets container
                this.bulletsContainer = document.createElement('div');
                this.bulletsContainer.setAttribute('class', 'js-carousel-bullets-container');

                this.bulletsWrapper.appendChild(this.bulletsContainer);
            }

            Array.prototype.forEach.call(this.items, function (item, index) {

                var img = item.querySelector('img'),
                    fakeImg = document.createElement('div'),
                    bullet;

                self.applyStyles(fakeImg, {
                    backgroundImage: 'url("' + img.src + '")',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                });

                self.applyStyles(img, {
                    display: 'none'
                });
                item.appendChild(fakeImg);


                if (self.settings.bullets && !!index && (index < (self.items.length - 1))) {

                    bullet = document.createElement('div');
                    bullet.setAttribute('class', 'bullet');
                    (index === 1) && bullet.classList.add('active');
                    bullet.addEventListener('click', function () {
                        self.goTo(index);
                    });
                    self.bulletsContainer.appendChild(bullet);
                }

                

            });

            if (this.settings.bullets) {
                this.container.appendChild(this.bulletsWrapper);
                this.bullets = this.bulletsContainer.childNodes;
            }

            this.inaction = false;

            this.handle.classList.add('loaded');

            (function (space) {

                var autoplay = space.settings.autoplay;
                
                //stop on hover
                space.container.addEventListener('mouseover', function () {
                    
                    autoplay && space.stop();
                });

                space.container.addEventListener('mouseout', function () {

                    autoplay && space.play();
                });
            }(this));
            

            //start autoplay
            this.settings.autoplay && this.play(this.settings.autoplayTimeout);


            //callback

            (this.settings.onload && typeof this.settings.onload === 'function') && this.settings.onload.call(this);

            
        },

        /**
        * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
        * images to fit into a certain area.
        *
        * @param {Number} srcWidth Source area width
        * @param {Number} srcHeight Source area height
        * @param {Number} maxWidth Fittable area maximum available width
        * @param {Number} maxHeight Fittable area maximum available height
        * @return {Object} { width, heigth }
        */
        calculateAspectRatioFit: function (srcWidth, srcHeight, maxWidth, maxHeight) {

            var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

            return { 
                width: srcWidth * ratio,
                height: srcHeight * ratio
            };
        },

        setOptions : function (options) {

            var n,
                i,
                l,
                autoplay;

            this.stop();            

            //apply options
            for (n in options) {
                this.settings[n] = options[n];
            }

            autoplay = this.settings.autoplay;

            //set animation function
            if (typeof this.settings.effect === 'string' && this.animationFunctions[this.settings.effect]) {
                this.settings.effect = this.animationFunctions[this.settings.effect];
            }
            
            //set time function
            if (typeof this.settings.timeFunction === 'string' && this.timeFunctions[this.settings.timeFunction]) {
                this.settings.timeFunction = this.timeFunctions[this.settings.timeFunction];
            } else if (typeof this.settings.timeFunction === 'string' && this.settings.timeFunction.match(/^cubic-bezier\(/gi)) {
                
                n = this.settings.timeFunction.match(/(\(.+\))/gi)[0].replace(/[\(\)\s]/gi, '').split(',');
                
                this.settings.timeFunction = function (progress) {
                    return new this.Bezier(n[0], n[1], n[2], n[3])(progress);
                }
            }

            //clear items styles
            l = this.items.length;
            for (i = 0; i < l; i += 1) {
                this.items[i].setAttribute('style', '');
            }

            //if (autoplay) {
            //    this.play();
            //}
        },

        delay: function (timeMs, callback) {

            var self = this;

            return setTimeout(function () {
                callback.call(self);
            }, timeMs);
        },

        goTo: function (action) {

            if (this.inaction) {
               return false;
            }

            var slideNumber = 1,
                xEnd = 0;

            //check the slide number type
            switch (typeof action) {
                
                case 'number':
                    action = (action > this.items.length - 1) ? this.items.length - 1 : Math.abs(action);
                    xEnd = - ((action - 1) * this.itemWidth) - this.itemWidth;
                    slideNumber = action;
                break;

                case 'string':
                    switch (action) {

                        case 'next':
                            xEnd = this.handle.offsetLeft - this.itemWidth;
                            slideNumber = Math.abs(xEnd / this.itemWidth);
                        break;

                        case 'prev':
                            xEnd = this.handle.offsetLeft + this.itemWidth;
                            slideNumber = Math.abs(xEnd / this.itemWidth);
                        break;

                        default:
                            action = parseInt(action, 10);
                            return (isNaN(action)) ? this.goTo(1) : this.goTo(action);
                        break;
                    }
                break;
            }

            slideNumber = (slideNumber > this.items.length - 2) ? 1 : slideNumber;
            slideNumber = (slideNumber < 1) ? this.items.length - 2 : slideNumber;

            //get current slide
            this.currentSlide = (Math.abs(this.handle.offsetLeft / this.itemWidth));

            
            this.settings.bullets && Array.prototype.forEach.call(this.bullets, function (bullet, index) {
                ((index + 1) === slideNumber) ? bullet.classList.add('active') : bullet.classList.remove('active');
            });

            //call animation function
            this.settings.effect.call(this, slideNumber);
        },

        next: function (e) {
            e && e.preventDefault && e.preventDefault();
            return this.goTo('next');
        },

        prev: function (e) {
            e && e.preventDefault && e.preventDefault();
            return this.goTo('prev');
        },

        play: function (timeWait) {

            timeWait = timeWait || 10;

            this.settings.autoplay = true;
            this.autoplayTimeoutId = this.delay(timeWait, function () {

                //go next
                if (!this.inaction) {
                    this.next();
                }

            });
        },

        stop: function () {
            this.settings.autoplay = false;
            clearTimeout(this.autoplayTimeoutId);
        },

        abort: function () {
            this.stop();
            this.abortStatus = true;
        },

        animate: function (element, property, value, units, callback, duration) {
            
            callback = callback || function () {};
            duration = duration || this.settings.duration;

            var self = this,
                startValue = parseInt(root.getComputedStyle(element)[property], 10),
                currentPos,
                delta = this.settings.timeFunction,
                startTime = new Date,
                timeProgress,
                timeIntId;

            timeIntId = setInterval(function() {

                if (self.abortStatus) {
                    clearInterval(timeIntId);
                    return;
                }

                timeProgress = (new Date - startTime) / duration;

                if (timeProgress > 1) {
                    timeProgress = 1;
                }

                (function (delta) {
                    //console.log(startValue);
                    currentPos = startValue + (value - startValue) * delta;
                    element.style[property] = currentPos + units;
                }(delta.call(self, timeProgress)));

                if (timeProgress == 1) {
                    clearInterval(timeIntId);
                    callback();
                }

            }, 10);
        },
        showSlide: function (slideNumber) {
            
            //set position to realy slide
            this.handle.style.left = - (this.itemWidth * (slideNumber)) + 'px';
        },

        animationBlock: function () {
            this.effectContainer.style.display = 'block';
            this.inaction = true;
            clearTimeout(this.autoplayTimeoutId);
        },

        animationUnblock: function () {
            this.inaction = false;
            this.effectContainer.style.display = 'none';
            
            if (this.settings.autoplay) {
                this.play(this.settings.autoplayTimeout);
            }
        },
        applyStyles: function (elem, styleObj) {
            var n;

            for (n in styleObj) {
                if (styleObj.hasOwnProperty(n)) {
                    elem.style[n] = styleObj[n];
                }
            }
        },
        getEffectsList: function () {
            var n,
                i = 0,
                listArray = [];

            for (n in this.animationFunctions) {
                if (this.animationFunctions.hasOwnProperty(n)) {
                    listArray[i] = n.toString();
                    i += 1;
                }
            }

            return listArray;
        },
        setEffect: function (effectName, effectFunction) {
            this.animationFunctions[effectName] = (effectFunction.bind(this));
        },
        isNextSlide: function (slideNumber) {
            return ((this.currentSlide === this.items.length - 2 && slideNumber === 1) || slideNumber - this.currentSlide === 1);
        },
        isPrevSlide: function (slideNumber) {
            return !this.isNextSlide(slideNumber);
        },
        isFirstSlide: function (slideNumber) {
            return (this.currentSlide === this.items.length - 2 && slideNumber === 1);
        },
        isLastSlide: function (slideNumber) {
            return !this.isFirstSlide(slideNumber);
        },














































































        animationFunctions: {

            random: function (slideNumber) {

                var effList = this.getEffectsList(),
                    rand = Math.floor(Math.random() * (effList.length - 1)) + 1;

                return this.animationFunctions[effList[rand]].call(this, slideNumber);
            },
            /*cube: function (slideNumber, horizontal) {
                
                horizontal = horizontal || false;

                var self = this,
                    cubeContainer,
                    cubicBezier = 'cubic-bezier(.58,.18,.4,.93)',
                    perspective = 1000,
                    cube,
                    cubeSideFront,
                    cubeSideBack,
                    frontShadow,
                    backShadow,
                    frontSideStyles,
                    backSideStyles,
                    tmp = self.effectContainer.style.overflow,
                    tmp2 = self.handle.style.opacity;

                //block animation
                self.animationBlock();

                //set reset overflow to main container
                self.effectContainer.style.overflow = 'visible';

                self.handle.style.opacity = 0;

                //clear effect container
                self.effectContainer.innerHTML = '';

                //create cube container
                cubeContainer = document.createElement('div');

                //create cube
                cube = document.createElement('div');

                //create sides
                cubeSideFront = document.createElement('div');
                cubeSideBack = document.createElement('div');

                //create shadows
                frontShadow = document.createElement('div');
                backShadow = document.createElement('div');

                self.applyStyles(cubeContainer, {
                    width: self.itemWidth + 'px',
                    height: self.itemHeight + 'px',
                    position: 'absolute',
                    perspective: perspective + 'px' 
                });

                //apply styles to cube
                self.applyStyles(cube, {
                    width: self.itemWidth + 'px',
                    height: self.itemHeight + 'px',
                    position: 'absolute',
                    transform: 'translateZ(-136px)'
                });

                if (horizontal) {
                    cube.style.transform = 'translateZ(-667px)';
                }

                frontSideStyles = {
                    display: 'block',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: self.itemWidth + 'px',
                    height: self.itemHeight + 'px',
                    transition: 'transform ' + self.settings.duration + 'ms',
                    boxSizing: 'border-box',
                    backfaceVisibility: 'hidden',
                    transform: 'perspective(' + perspective + 'px) rotateX(0deg) rotateZ(0deg) rotateY(0deg) translateZ(' + (self.itemHeight / 2) + 'px)'
                };
               

                backSideStyles = {
                    display: 'block',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: self.itemWidth + 'px',
                    height: self.itemHeight + 'px',
                    transition: 'transform ' + self.settings.duration + 'ms',
                    boxSizing: 'border-box',
                    backfaceVisibility: 'hidden',
                    transform: 'perspective(' + perspective + 'px) rotateX(' + (this.isNextSlide(slideNumber) ? '' : '-') + '90deg) rotateZ(0deg) rotateY(0deg) translateZ(' + (self.itemHeight / 2) + 'px)'
                };

                if (horizontal) {
                    frontSideStyles.transform = 'perspective(' + perspective + 'px) rotateX(0deg) rotateZ(0deg) rotateY(0deg) translateZ(' + (self.itemWidth / 2) + 'px) translateX(0px)';
                    backSideStyles.transform = 'perspective(' + perspective + 'px) rotateX(0deg) rotateZ(0deg) rotateY(' + (this.isNextSlide(slideNumber) ? '-' : '') + '90deg) translateZ(' + (self.itemWidth / 2) + 'px) translateX(0px)';
                }


                //apply styles to side front
                self.applyStyles(cubeSideFront, frontSideStyles);

                //apply styles to side top
                self.applyStyles(cubeSideBack, backSideStyles);

                //apply style styles to shadow front
                self.applyStyles(frontShadow, frontSideStyles);
                self.applyStyles(frontShadow, {
                    background: 'linear-gradient' + (this.isNextSlide(slideNumber) ? '(to bottom,  rgba(0,0,0,0.41) 0%,rgba(0,0,0,0.77) 60%,rgba(0,0,0,1) 100%)' : '(to bottom, #000 0%, rgba(0, 0, 0, 0.7) 60%, rgba(0, 0, 0, 0.5) 100%)'),
                    transition: 'opacity ' + (self.settings.duration / 2) + 'ms, transform ' + self.settings.duration + 'ms',
                    opacity: 0,
                    zIndex: 1
                });
                
                //apply style styles to shadow top
                self.applyStyles(backShadow, backSideStyles);
                self.applyStyles(backShadow, {
                    background: 'linear-gradient' + (this.isNextSlide(slideNumber) ? '(to bottom,  rgba(0,0,0,1) 0%,rgba(0,0,0,0.75) 60%,rgba(0,0,0,0.80) 100%)' : '(to bottom,  rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.8) 60%,rgba(0,0,0,1) 100%)'),
                    transition: 'opacity ' + self.settings.duration + 'ms, transform ' + self.settings.duration + 'ms',
                    opacity: 1,
                    zIndex: 1
                });




                if (horizontal) {
                    if (this.isNextSlide(slideNumber)) {
                        frontShadow.style.background = 'linear-gradient(to right, rgba(0, 0, 0, 0.41) 0%, rgba(0, 0, 0, 0.77) 60%, #000 100%)'; 
                        backShadow.style.background = 'linear-gradient(to right, #000 0%, rgba(0, 0, 0, 0.73) 60%, rgba(0, 0, 0, 0.22) 100%)'; 
                    } else {
                        frontShadow.style.background = 'linear-gradient(to right, #000 0%, rgba(0, 0, 0, 0.73) 60%, rgba(0, 0, 0, 0.22) 100%)'; 
                        backShadow.style.background = 'linear-gradient(to right,  rgba(0,0,0,0.41) 0%, rgba(0,0,0,0.77) 60%, rgba(0,0,0,1) 100%)';   
                    }
                }




                //put slides into the sides
                cubeSideFront.appendChild(this.items[self.currentSlide].childNodes[0].cloneNode(true));
                cubeSideBack.appendChild(this.items[slideNumber].childNodes[0].cloneNode(true));

                self.applyStyles(cubeSideFront.querySelector('img'), {
                    width: self.itemWidth + 'px',
                    height: self.itemHeight + 'px',
                });

                self.applyStyles(cubeSideBack.querySelector('img'), {
                    width: self.itemWidth + 'px',
                    height: self.itemHeight + 'px',
                });

                //put shadows
                cube.appendChild(frontShadow);
                cube.appendChild(backShadow);

                //put sides into the cube
                cube.appendChild(cubeSideFront);
                cube.appendChild(cubeSideBack);

                //append cube into the cube container
                cubeContainer.appendChild(cube);
                
                //append cube contaiber into the effect container
                self.effectContainer.appendChild(cubeContainer);

                //start the animation
                self.delay(100, function () {

                    //cube animation

                    if (horizontal) {
                        
                        self.applyStyles(cubeSideFront, {
                           transform: 'perspective(' + perspective + 'px) rotateX(0deg) rotateZ(0deg) rotateY(' + (this.isNextSlide(slideNumber) ? '' : '-') + '90deg) translateZ(' + (self.itemWidth / 2) + 'px) translateX(0px)'
                        });

                        self.applyStyles(cubeSideBack, {
                           transform: 'perspective(' + perspective + 'px) rotateX(0deg) rotateZ(0deg) rotateY(0deg) translateZ(' + (self.itemWidth / 2) + 'px) translateX(0px)'
                        });

                    } else {
                        
                        self.applyStyles(cubeSideFront, {
                           transform: 'perspective(' + perspective + 'px) rotateX(' + (this.isNextSlide(slideNumber) ? '-' : '') + '90deg) rotateZ(0deg) rotateY(0deg) translateZ(' + (self.itemHeight / 2) + 'px)'
                        });

                        self.applyStyles(cubeSideBack, {
                           transform: 'perspective(' + perspective + 'px) rotateX(0deg) rotateZ(0deg) rotateY(0deg) translateZ(' + (self.itemHeight / 2) + 'px)'
                        });  

                    }
                    

                    //shadow animation
                    if (horizontal) {
                        self.applyStyles(frontShadow, {
                            transform: 'perspective(' + perspective + 'px) rotateX(0deg) rotateZ(0deg) rotateY(' + (this.isNextSlide(slideNumber) ? '' : '-') + '90deg) translateZ(' + (self.itemWidth / 2) + 'px) translateX(0px)',
                            opacity: 1
                        });

                        self.applyStyles(backShadow, {
                           transform: 'perspective(' + perspective + 'px) rotateX(0deg) rotateZ(0deg) rotateY(0deg) translateZ(' + (self.itemWidth / 2) + 'px) translateX(0px)',
                           opacity: 0
                        });
                    } else {
                        self.applyStyles(frontShadow, {
                            transform: 'perspective(' + perspective + 'px) rotateX(' + (this.isNextSlide(slideNumber) ? '-' : '') + '90deg) rotateZ(0deg) rotateY(0deg) translateZ(' + (self.itemHeight / 2) + 'px)',
                            opacity: 1
                        });

                        self.applyStyles(backShadow, {
                           transform: 'perspective(' + perspective + 'px) rotateX(0deg) rotateZ(0deg) rotateY(0deg) translateZ(' + (self.itemHeight / 2) + 'px)',
                           opacity: 0
                        });
                    }

                });

                //return;
                self.delay(self.settings.duration, function () {

                    //back old style values to main container
                    self.effectContainer.style.overflow = tmp;

                    self.handle.style.opacity = tmp2;

                    //set position to realy slide
                    self.showSlide(slideNumber);

                    //clear effect container
                    self.effectContainer.innerHTML = '';

                    //unblock animation
                    self.animationUnblock();
                });


            },
            cubeHorizontal: function (slideNumber) {
                return this.animationFunctions.cube.apply(this, [slideNumber, true]);
            },*/
            briks: function (slideNumber) {
                var self = this,
                    brickPersentHeight = 20,
                    bricksCountInRow = Math.ceil(100 / brickPersentHeight),
                    brickHeight = self.itemHeight / bricksCountInRow,
                    bricksCountInColumn = Math.ceil(100 / brickPersentHeight),
                    brickWidth = self.itemWidth / bricksCountInColumn,
                    childNodes = self.items[slideNumber].childNodes,
                    elem,
                    imageHandle,
                    durationTime = self.settings.duration / (bricksCountInRow * bricksCountInColumn),
                    bricksElems,
                    imageSrc,
                    row,
                    coll,
                    i,
                    l;

                //check to child elements
                if (!childNodes) {
                    return self.animationFunctions.carousel.call(self, slideNumber);
                }

                /*l = childNodes.length;
                for (i = 0; i < l; i += 1) {
                    if (childNodes[i].tagName !== 'IMG') {
                        return self.animationFunctions.carousel.call(self, slideNumber);
                    }
                }*/

                //block animation
                self.animationBlock();

                //clear effect container
                self.effectContainer.innerHTML = '';

                //get image handle
                imageHandle = self.items[slideNumber].querySelector('img');

                imageHandle.style.width = self.itemWidth + 'px';
                imageHandle.style.height = self.itemHeight + 'px';

                //get image src
                imageSrc = imageHandle.getAttribute('src');

                //create bricks
                for (row = 0; row < bricksCountInRow; row += 1) {

                    for (coll = 0; coll < bricksCountInColumn; coll += 1) {
                    
                        //create brick
                        elem = document.createElement('div');

                        //apply styles
                        self.applyStyles(elem, {
                            backgroundImage: 'url(' + imageSrc + ')',
                            backgroundPosition: '-' + (brickWidth * coll) + 'px -' + (brickHeight * row) + 'px',
                            backgroundSize: self.itemWidth + 'px ' + self.itemHeight + 'px',
                            top: (brickHeight * row) + 'px',
                            left: (brickWidth * coll) + 'px',
                            width: brickWidth + 'px',
                            height: brickHeight + 'px',
                            position: 'absolute',
                            opacity: 0
                        });

                        //append into the effect container
                        self.effectContainer.appendChild(elem);
                    }
                }

                //start animation
                bricksElems = self.effectContainer.querySelectorAll('div');
                l = bricksElems.length;

                for (i = 0; i < l; i += 1) {

                    (function (brick, index, allCount) {

                        var delayTime = index * durationTime;

                        self.delay(delayTime, function () {

                            self.animate(brick, 'opacity', 1, '', function () {

                                if (index === allCount) {

                                    //set position to realy slide
                                    self.showSlide(slideNumber);

                                    //clear effect container
                                    self.effectContainer.innerHTML = '';

                                    //unblock animation
                                    self.animationUnblock();
                                }
                            }, durationTime * (index + 2));
                        });

                    }(bricksElems[i], i, l - 1));
                }  
            },
            carousel: function (slideNumber) {
                var self = this;

                this.animationBlock();

                //if slide to next
                if (this.isNextSlide(slideNumber)) {
                    
                    //animation slide to right
                    this.animate(this.handle, 'left', this.handle.offsetLeft - this.itemWidth, 'px', function () {
                        
                        //if is pseudo first slide
                        if (self.isFirstSlide(slideNumber)) {
                            self.handle.style.left = - self.itemWidth + 'px';
                        }

                        self.animationUnblock();
                    });
                //if slide to prev
                } else {

                    //animation slide to left
                    this.animate(this.handle, 'left', this.handle.offsetLeft + this.itemWidth, 'px', function () {
                        
                        //if is pseudo last slide
                        if (self.currentSlide === 1 && slideNumber === self.items.length - 2) {
                            self.handle.style.left = - (self.itemWidth * (self.items.length - 2)) + 'px';
                        }

                        self.animationUnblock();
                    });
                }
            },

            slideHorizontal: function (slideNumber) {
                var self = this;

                self.animationBlock();
                self.animate(self.handle, 'left', -(self.itemWidth * slideNumber), 'px', function () {
                    self.animationUnblock();
                });
            },
            parallax: function (slideNumber) {

                var self = this,
                    fakeSlide1,
                    fakeSlide2,
                    filterProps = ['webkitFilter', 'mozFilter', 'msFilter', 'oFilter', 'filter'],
                    l = filterProps.length,
                    i,
                    fakeSlideEndPos = (self.currentSlide < slideNumber) ? -self.itemWidth : self.itemWidth,
                    originalDuration = self.settings.duration;

                self.animationBlock();


                var createFakeSlide = function () {
                    
                    var rand = Math.floor(Math.random() * ((self.items.length - 2))) + 1,
                        elem = self.items[rand].cloneNode(true);

                    //set styles for fake slide
                    self.applyStyles(elem, {
                        position: 'absolute',
                        left: ((self.currentSlide < slideNumber) ? self.itemWidth : -self.itemWidth) + 'px',
                        top: 0,
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        overflow: 'hidden'
                    });

                    //put fake slide to viewport
                    self.effectContainer.appendChild(elem);

                    //set the blur effect
                    for (i = 0; i < l; i += 1) {
                        if (typeof elem.style[filterProps[i]]) {
                            elem.style[filterProps[i]] = 'blur(1px)';
                        }
                    }

                    return elem;
                };

                fakeSlide1 = createFakeSlide();
                fakeSlide2 = createFakeSlide();



                //set new duration value
                self.settings.duration = originalDuration * 2;

                //call carousel effect
                self.animationFunctions.carousel.call(self, slideNumber);
                
                //set original duration value
                self.settings.duration = originalDuration;
                



                //animate fake slide 1
                self.animate(fakeSlide1, 'left', fakeSlideEndPos, 'px', function () {

                    //set position to realy slide
                    self.showSlide(slideNumber);
                
                    //remove fake slide
                    fakeSlide1.parentNode.removeChild(fakeSlide1);

                }, self.settings.duration * 2);

            },

            fade: function (slideNumber) {

                var self = this,
                    fakeSlide = self.items[slideNumber].cloneNode(true);

                self.animationBlock();

                //half duration on every slide
                self.settings.duration = self.settings.duration;

                //set styles for fake slide
                self.applyStyles(fakeSlide, {
                    opacity: 0,
                    position: 'absolute',
                    left: self.items[self.currentSlide].offsetLeft + 'px'
                });

                //put fake slide to viewport
                self.handle.appendChild(fakeSlide);

                //animate to show fake slide
                self.animate(fakeSlide, 'opacity', 1, '', function () {

                    //set position to realy slide
                    self.showSlide(slideNumber);

                    //remove fake slide
                    fakeSlide.parentNode.removeChild(fakeSlide);

                    //unblock animation
                    self.animationUnblock();
                });
            },

            flash: function (slideNumber) {
                
                var self = this;

                self.animationBlock();

                //half duration on every slide
                self.settings.duration = self.settings.duration / 2;

                self.items[slideNumber].style.opacity = 0;

                self.animate(self.items[self.currentSlide], 'opacity', 0, '', function () {

                    //set position to new slide
                    self.showSlide(slideNumber);

                    //show new slide
                    self.animate(self.items[slideNumber], 'opacity', 1, '', function () {

                        //unblock animation
                        self.animationUnblock();
                    });
                    
                    //show hidden slide
                    self.items[self.currentSlide].style.opacity = 1;

                    //return duration
                    self.settings.duration = self.settings.duration * 2;
                });
            },
            list: function (slideNumber) {

               var self = this,
                    fakeSlide = self.items[slideNumber].cloneNode(true);

                self.animationBlock();

                //half duration on every slide
                self.settings.duration = self.settings.duration;

                //set styles for fake slide
                fakeSlide.style.width = 0;
                fakeSlide.style.overflow = 'hidden';
                fakeSlide.style.position = 'absolute';
                fakeSlide.style.left = self.items[self.currentSlide].offsetLeft + 'px';

                //put fake slide to viewport
                self.handle.appendChild(fakeSlide);

                //animate to show fake slide
                self.animate(fakeSlide, 'width', self.itemWidth, 'px', function () {

                    //set position to realy slide
                    self.showSlide(slideNumber);

                    //remove fake slide
                    fakeSlide.parentNode.removeChild(fakeSlide);

                    //unblock animation
                    self.animationUnblock();
                });
            },

            slice: function (slideNumber, direction, slicePersentHeight) {

                direction = direction || 'left';
                slicePersentHeight = slicePersentHeight || 20;

                var self = this,
                    sliceCout = Math.ceil(100 / slicePersentHeight),
                    sliceWidth = self.itemWidth,
                    sliceHeight = self.itemHeight / sliceCout,
                    elem,
                    childNodes = self.items[slideNumber].childNodes,
                    imageHandle,
                    imageSrc,
                    i,
                    l,
                    slicesElems,
                    slideElem;

                //check to child elements
                if (!childNodes) {
                    return self.animationFunctions.carousel.call(self, slideNumber);
                }

                /*l = childNodes.length;
                for (i = 0; i < l; i += 1) {
                    if (childNodes[i].tagName !== 'IMG') {
                        return self.animationFunctions.carousel.call(self, slideNumber);
                    }
                }*/

                //block animation
                this.animationBlock();

                //clear effect container
                self.effectContainer.innerHTML = '';

                //get image handle
                imageHandle = self.items[slideNumber].querySelector('img');

                imageHandle.style.width = self.itemWidth + 'px';
                imageHandle.style.height = self.itemHeight + 'px';

                //get image src
                imageSrc = imageHandle.getAttribute('src');

                //create slice blocks
                for (i = 0; i < sliceCout; i += 1) {
                    
                    //create slice
                    elem = document.createElement('div');

                    elem.style.backgroundSize = self.itemWidth + 'px ' + self.itemHeight + 'px';

                    if (direction === 'top' || direction === 'bottom') {
                        sliceWidth = self.itemWidth / sliceCout;
                        sliceHeight = self.itemHeight;
                        elem.style.backgroundPosition = '-' + (sliceWidth * i) + 'px 0';
                        elem.style[direction] = (-sliceHeight) + 'px';
                        elem.style.left = (sliceWidth * i) + 'px';
                    } else {
                        elem.style.backgroundPosition = '0 -' + (sliceHeight * i) + 'px';
                        elem.style.top = (sliceHeight * i) + 'px';
                        elem.style[direction] = -sliceWidth + 'px';
                    }

                    elem.style.width = sliceWidth + 'px';
                    elem.style.height = sliceHeight + 'px';
                    elem.style.backgroundImage = 'url(' + imageSrc + ')';
                    elem.style.position = 'absolute';

                    //set positions
                    elem.style.opacity = 0;

                    //append into the effect container
                    self.effectContainer.appendChild(elem);

                }

                //start animation
                slicesElems = self.effectContainer.querySelectorAll('div');
                l = slicesElems.length;

                for (i = 0; i < l; i += 1) {

                    (function (slice, index, allCount) {

                        var delayTime = index * 100;

                        self.delay(delayTime, function () {

                            self.animate(slice, direction, 0, 'px');
                            self.animate(slice, 'opacity', 1, '', function () {

                                if (index === allCount) {

                                    //set position to realy slide
                                    self.showSlide(slideNumber);

                                    //clear effect container
                                    self.effectContainer.innerHTML = '';

                                    //unblock animation
                                    self.animationUnblock();
                                }
                            });
                        });

                    }(slicesElems[i], i, l - 1));
                }  
            },

            slicePrizma: function (slideNumber, useDelay) {

                var self = this,
                    slicePersentWidth = 6,
                    sliceCout = Math.ceil(100 / slicePersentWidth),
                    sliceHeight = self.itemHeight,
                    sliceWidth = self.itemWidth / sliceCout,
                    elem,
                    childNodes = self.items[slideNumber].childNodes,
                    imageHandle,
                    imageSrc,
                    durationTime = self.settings.duration / sliceCout,
                    i,
                    l,
                    slicesElems,
                    direction;
                    
                //check to child elements
                if (!childNodes) {
                    return self.animationFunctions.carousel.call(self, slideNumber);
                }

                //block animation
                this.animationBlock();

                //clear effect container
                self.effectContainer.innerHTML = '';

                //get image handle
                imageHandle = self.items[slideNumber].querySelector('img');

                imageHandle.style.width = self.itemWidth + 'px';
                imageHandle.style.height = self.itemHeight + 'px';

                //get image src
                imageSrc = imageHandle.getAttribute('src');

                //create slice blocks
                for (i = 0; i < sliceCout; i += 1) {
                    
                    //create slice
                    elem = document.createElement('div');

                    self.applyStyles(elem, {
                        backgroundSize: self.itemWidth + 'px ' + self.itemHeight + 'px',
                        width: 0,
                        height: sliceHeight + 'px',
                        backgroundImage: 'url(' + imageSrc + ')',
                        position: 'absolute',
                        opacity: 0
                    });

                    sliceWidth = self.itemWidth / sliceCout;
                    sliceHeight = self.itemHeight;

                    self.applyStyles(elem, {
                        backgroundPosition: '-' + (sliceWidth * i) + 'px 0',
                        top: 0,
                        left: (sliceWidth * i) + 'px'
                    });


                    //append into the effect container
                    self.effectContainer.appendChild(elem);
                }

                
                //start animation
                slicesElems = self.effectContainer.querySelectorAll('div');
                l = slicesElems.length;

                for (i = 0; i < l; i += 1) {

                    (function (slice, index, allCount) {
                        
                        var delayTime = useDelay ? index * durationTime : 0,
                            delayTime2 = useDelay ? durationTime * index : self.settings.duration;

                        self.delay(delayTime, function () {

                            self.animate(slice, 'width', sliceWidth, 'px');
                            self.animate(slice, 'opacity', 1, '', function () {

                                if (index === allCount) {

                                    //set position to realy slide
                                    self.showSlide(slideNumber);

                                    //clear effect container
                                    self.effectContainer.innerHTML = '';

                                    //unblock animation
                                    self.animationUnblock();
                                }
                            }, delayTime2);
                        });


                    }(slicesElems[i], i, l - 1));
                }
            },

            slicePrizmaUseDelay: function (slideNumber) {
                return this.animationFunctions.slicePrizma.apply(this, [slideNumber, true]);
            },

            sliceTopBottom: function (slideNumber, useDelay) {

                var self = this,
                    slicePersentWidth = 6,
                    sliceCout = 100 / slicePersentWidth,
                    sliceHeight = self.itemHeight,
                    sliceWidth = self.itemWidth / sliceCout,
                    elem,
                    childNodes = self.items[slideNumber].childNodes,
                    imageHandle,
                    imageSrc,
                    i,
                    l,
                    slicesElems,
                    direction;
                    
                //check to child elements
                if (!childNodes) {
                    return self.animationFunctions.carousel.call(self, slideNumber);
                }

                /*l = childNodes.length;
                for (i = 0; i < l; i += 1) {
                    if (childNodes[i].tagName !== 'IMG') {
                        return self.animationFunctions.carousel.call(self, slideNumber);
                    }
                }*/

                //block animation
                this.animationBlock();

                //clear effect container
                self.effectContainer.innerHTML = '';

                //get image handle
                imageHandle = self.items[slideNumber].querySelector('img');

                imageHandle.style.width = self.itemWidth + 'px';
                imageHandle.style.height = self.itemHeight + 'px';

                //get image src
                imageSrc = imageHandle.getAttribute('src');

                //create slice blocks
                for (i = 0; i < sliceCout; i += 1) {
                    
                    //create slice
                    elem = document.createElement('div');

                    self.applyStyles(elem, {
                        backgroundSize: self.itemWidth + 'px ' + self.itemHeight + 'px',
                        width: sliceWidth + 'px',
                        height: sliceHeight + 'px',
                        backgroundImage: 'url(' + imageSrc + ')',
                        position: 'absolute',
                        opacity: 0
                    });

                    direction = (!(i % 2)) ? 'top' : 'bottom';
                    sliceWidth = self.itemWidth / sliceCout;
                    sliceHeight = self.itemHeight;
                    
                    elem.style.backgroundPosition = '-' + (sliceWidth * i) + 'px 0';
                    elem.style[direction] = (-sliceHeight) + 'px';
                    elem.style.left = (sliceWidth * i) + 'px';

                    //append into the effect container
                    self.effectContainer.appendChild(elem);
                }

                //return;
                //start animation
                slicesElems = self.effectContainer.querySelectorAll('div');
                l = slicesElems.length;

                for (i = 0; i < l; i += 1) {

                    (function (slice, index, allCount) {
                        
                        var delayTime = useDelay ? index * 50 : 0;
                        
                        self.delay(delayTime, function () {

                            var direction = (!(index % 2)) ? 'top' : 'bottom';

                            self.animate(slice, direction, 0, 'px');
                            self.animate(slice, 'opacity', 1, '', function () {

                                if (index === allCount) {

                                    //set position to realy slide
                                    self.showSlide(slideNumber);

                                    //clear effect container
                                    self.effectContainer.innerHTML = '';

                                    //unblock animation
                                    self.animationUnblock();
                                }
                            });
                        });


                    }(slicesElems[i], i, l - 1));
                }
            },

            sliceTopBottomUseDelay: function (slideNumber) {
                return this.animationFunctions.sliceTopBottom.apply(this, [slideNumber, true]);
            },

            sliceToRight: function (slideNumber) {
                return this.animationFunctions.slice.apply(this, [slideNumber, 'left', 20]);
            },

            sliceToLeft: function (slideNumber) {
                return this.animationFunctions.slice.apply(this, [slideNumber, 'right', 20]);
            },

            sliceToTop: function (slideNumber) {
                return this.animationFunctions.slice.apply(this, [slideNumber, 'top', 8]);
            },

            sliceToBottom: function (slideNumber) {
                return this.animationFunctions.slice.apply(this, [slideNumber, 'bottom', 8]);
            },

            sliceRandom: function (slideNumber) {
                var rand = Math.floor(Math.random() * (8)) + 1,
                    sliceFunction = 'sliceToLeft';

                switch (rand) {
                    case 1:
                        sliceFunction = 'sliceToLeft';
                    break;

                    case 2:
                        sliceFunction = 'sliceToRight';
                    break;

                    case 3:
                        sliceFunction = 'sliceToTop';
                    break;

                    case 4:
                        sliceFunction = 'sliceToBottom';
                    break;

                    case 5:
                        sliceFunction = 'sliceTopBottom';
                    break;

                    case 6:
                        sliceFunction = 'sliceTopBottomUseDelay';
                    break;

                    case 7:
                        sliceFunction = 'slicePrizma';
                    break;

                    case 8:
                        sliceFunction = 'slicePrizmaUseDelay';
                    break;
                }
                return this.animationFunctions[sliceFunction].apply(this, [slideNumber]);
            }
        },
        timeFunctions: {
            linear: function (progress) {
                //return new this.Bezier(0, 0, 1.0, 1.0)(progress);
                return progress;
            },
            quad: function (progress) {
                return Math.pow(progress, 2);
            },
            bounce: function (progress) {
                for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
                    if (progress >= (7 - 4 * a) / 11) {
                        return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
                    }
                }
            },
            circ: function (progress) {
                return 1 - Math.sin(Math.acos(progress));
            },
            back: function (progress) {
                var x = 1.5;
                return Math.pow(progress, 2) * ((x + 1) * progress - x);
            },
            elastic: function (progress) {
                var x = 1.5;
                return Math.pow(2, 10 * (progress - 1)) * Math.cos(20 * Math.PI * x / 3 * progress);
            },
            easeInQuad: function (progress) {
                return progress * progress;
            },
            easeOutQuad: function (progress) { 
                return progress * (2 - progress);
            },
            easeInOutQuad: function (progress) { 
                return progress < .5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            },
            easeInCubic: function (progress) {
                return progress * progress * progress; 
            },
            easeOutCubic: function (progress) { 
                return (--progress) * progress * progress +1;
            },
            easeInOut: function (progress) {
                return new this.Bezier(.42, 0, .58, 1.0)(progress);
            },
            easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
            // accelerating from zero velocity 
            easeInQuart: function (t) { return t*t*t*t },
            // decelerating to zero velocity 
            easeOutQuart: function (t) { return 1-(--t)*t*t*t },
            // acceleration until halfway, then deceleration
            easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
            // accelerating from zero velocity
            easeInQuint: function (t) { return t*t*t*t*t },
            // decelerating to zero velocity
            easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
            // acceleration until halfway, then deceleration 
            easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
            sine: function (progress) {
                return 1 - Math.sin((1 - progress) * Math.PI/2);
            },
            test: function (progress) {
                return new this.Bezier(.17, 1.12, .02, -0.55)(progress);
            }
        },

        Bezier: function (p1,p2,p3,p4) {
            // defining the bezier functions in the polynomial form
            var Cx = 3 * p1;
            var Bx = 3 * (p3 - p1) - Cx;
            var Ax = 1 - Cx - Bx;
            
            var Cy = 3 * p2;
            var By = 3 * (p4 - p2) - Cy;
            var Ay = 1 - Cy - By;
            
            function bezier_x(t) { return t * (Cx + t * (Bx + t * Ax)); }
            function bezier_y(t) { return t * (Cy + t * (By + t * Ay)); }
            
            
            // using Newton's method to aproximate the parametric value of x for t
            function bezier_x_der(t) { return Cx + t * (2*Bx + 3*Ax * t); }
            
            function find_x_for(t) {
              var x=t, i=0, z;
            
              while (i < 5) { // making 5 iterations max
                z = bezier_x(x) - t;
            
                if (Math.abs(z) < 1e-3) break; // if already got close enough
            
                x = x - z/bezier_x_der(x);
                i++;
              }
            
              return x;
            };
            
            return function(t) {
              return bezier_y(find_x_for(t));
            }
        }
    };

    /**
     * Encapsulation
     * @return {Object} - this handle
     */
    root[common.className] = function () {

        function construct(constructor, args) {

            function Class() {
                return constructor.apply(this, args);
            }

            Class.prototype = constructor.prototype;
            return new Class();
        }

        var publicly = construct(Protected, arguments),
            i,
            l = common.publicMethods.length;

        for (i = 0; i < l; i += 1) {

            (function () {
                var member = common.publicMethods[i];
                root[common.className].prototype[member] = function () {
                    return publicly[member].apply(publicly, arguments);
                };
            }());
        }

        return this;
    };

}(this));



(function () {

			//init carousel
  var jsCarousel = new JsCarousel(document.querySelector('.my-carousel'), {
				timeFunction: 'easeInOut',
				effect: 'random',
				duration: 1250,
				autoplay: true,
				autoplayTimeout: 5000,
				bullets: true,
				controls: true
	});
}());

