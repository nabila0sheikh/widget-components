import React, { Component, cloneElement } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types'
import styles from './Carousel.scss'
import OutcomeButtonUI from '../OutcomeButton/OutcomeButtonUI'

const imagesLoaded = (parentNode) => {
   const imgElements = parentNode.querySelectorAll('img')

   if (imgElements == null || imgElements.length < 1) {
      return false
   }

   imgElements.forEach((img, index) => {
      if (!img.complete) {
         return false
      }
   })

   return true
}

class Carousel extends Component {

   constructor(props) {
      super(props);
      this.timer;

      this.state = {
         isMouseEntered: false,
         currentPosition: props.selectedItem,
         lastPosition: null,
         carouselItems: null,
         imagesLoaded: false,
         cssAnimation: {},
         initialized: false,
         itemSize: 0
      }
   }

   componentDidMount() {
      if (this.props.carouselItemsArray == null || this.props.carouselItemsArray.length < 1) {
         return;
      }
      this.setupCarousel()
   }

   componentDidUpdate() {
      this.adaptHeight()

      if (!this.state.initialized) {
         this.setupCarousel()
      }
   }

   setupCarousel() {

      this.setupCarouselItems()
      this.bindEvents()

      if (this.props.autoPlay) {
         this.setupAutoPlay()
      }

      this.setState({
         initialized: true
      }, () => this.props.initializedCarousel(true))
   }

   setupCarouselItems() {
      if (!this.props.children) {
         const itemsArray = this.props.carouselItemsArray

         if (itemsArray != null && Array.isArray(itemsArray)) {
            const items = [...itemsArray, itemsArray[0]]
            this.setState({
               carouselItems: items,
               lastPosition: items.length - 1
            })

         }
      } else {
         const { children } = this.props;
         const items = [...children, children[0]]
         this.setState({
            carouselItems: items,
            lastPosition: items.length - 1
         })
      }

   }

   bindEvents() {
      window.addEventListener('resize', () => {
         clearTimeout(this.resizeTimeout);
         this.resizeTimeout = setTimeout(() => this.adaptHeight(), 200);
      });
   }

   adaptHeight() {
      if (this.state.carouselItems == null && !this.state.imagesLoaded) {
         return null
      }


      // const item = this[`item${this.state.currentPosition}`]
      // const images = item && item.getElementsByTagName('img') // returns an array
      //
      // if (images.length <= 0) {
      //    return null
      // }
      //
      // const image = images[0]; // First image in the array
      // // should only be one image as each 'item' === each <li> tag
      //
      // // Access the image height and width
      // const height = image.clientHeight;
      // const width = image.clientWidth;
      //
      // this.props.height
      // onCarouselHeightChange()
      // Call setWidgetHeight from widgetModule to set the height of the iframe
      // widgetModule.setWidgetHeight(
      //    // Use height/width * window width to maintain aspect ratio
      //    (height / width) * window.innerWidth
      // )
   }

   setupAutoPlay() {

      this.autoPlay()
      const carouselWrapper = this.carouselWrapper

      if (this.props.stopOnHover && carouselWrapper) {
         carouselWrapper.addEventListener('mouseenter', () => {
            this.stopOnHover()
         })
         carouselWrapper.addEventListener('mouseleave', () => {
            this.startOnHoverLeave()
         })
      }
   }

   autoPlay() {
      this.timer = setTimeout(() => {
         this.increment()
      }, this.props.intervalDuration)
   }

   clearAutoPlay() {
      clearTimeout(this.timer)
   }

   resetAutoPlay() {
      this.clearAutoPlay()
      this.autoPlay()
   }

   stopOnHover() {
      this.setState({ isMouseEntered: true })
      this.clearAutoPlay()
   }

   startOnHoverLeave() {
      this.setState({ isMouseEntered: false })
      this.autoPlay()
   }

   decrement(positions) {
      this.moveTo(this.state.currentPosition - (typeof positions === 'Number' ? positions : 1));
   }

   increment(positions) {
      this.moveTo(this.state.currentPosition + (typeof positions === 'Number' ? positions : 1));
   }

   moveTo(position) {
      if (position < 0 ) {
         position = this.props.infiniteLoop ? this.state.lastPosition : 1;
      }

      if (position > this.state.lastPosition) {
         position = this.props.infiniteLoop ? 1 : this.state.lastPosition;
      }

      this.setState({
         // if it's not a slider, we don't need to set position here
         currentPosition: position
      });

      this.setSliderStyles()

      // don't reset auto play when stop on hover is enabled, doing so will trigger a call to auto play more than once
      // and will result in the interval function not being cleared correctly.
      if (this.props.autoPlay && this.state.isMouseEntered === false) {
         this.resetAutoPlay();
      }
   }


   setSliderStyles() {
      const currentPosition = `${-this.state.currentPosition * 100}%`
      let animationObject = {}

      if (this.props.animationType === 'slide') {

         animationObject = {
            transform: `translate3d(${currentPosition}, 0, 0)`,
            transition: `${this.props.transitionDuration}ms ${this.props.cssEase}`
         }

         this.setState({
            cssAnimation: animationObject
         }, () => this.props.onCarouselChange(this.state.currentPosition))

         if (this.state.currentPosition === this.state.lastPosition) {
            // Reset the current slide position back to 0% with no transition
            setTimeout(() => {
               this.setState({
                  cssAnimation: {
                     transform: 'translate3d(0%, 0, 0)',
                     transition: 'none'
                  }
               })
            }, this.props.transitionDuration)
         }

      } else if (this.props.animationType === 'fade') {

         animationObject = {
            transform: 'translate3d(0%, 0, 0)',
         }

         this.setState({
            cssAnimation: animationObject
         }, () => this.props.onCarouselChange(this.state.currentPosition))

      } else {

         console.error(`You used the animation value ${this.props.animationType} which is not currently supported by the carousel. Please use one of 'slide' or 'fade'.`)

      }
   }

   imageChangeHandler(image = false) {

      if (!image) {
         const carouselWrapper = this.carouselWrapper

         this.setState({
            imagesLoaded: imagesLoaded(carouselWrapper)
         })
      } else {
         this.setState({
            imagesLoaded: true
         })
      }

   }

   renderImage(item, index) {

      const imgEvents = {
         onLoad: (img) => this.imageChangeHandler(img),
         onError: (img) => this.imageChangeHandler(img)
      }

      if (item.hasOwnProperty('imagePath')) {
         let styleObject = {
            backgroundPosition: `${item.imagePositionX} ${item.imagePositionY}`,
            backgroundImage: `url(${item.imagePath})`,
            width: '100%',
            height: '100%'
         }

         // TODO enable catching onload of the images to start the autoplay after the images have loaded

         // const img = new Image()
         // img.onload = () => {
         //    // imgEvents.onLoad(true)
         //    styleObject = Object.assign(styleObject, {
         //       backgroundImage: `url(${item.imagePath})`,
         //    })
         // }
         // img.src = item.imagePath
         //
         // const int = setInterval(() => {
         //    if (img.complete) {
         //       img.onload()
         //       clearInterval(int)
         //
         //       return (
         //          <div
         //             className='img'
         //             style={styleObject}
         //          />
         //       )
         //    }
         // }, 50)

         return (
            <div
               className='img'
               style={styleObject}
            />
         )
      }

      return cloneElement(item, {
         onload: imgEvents.onLoad,
         onerror: imgEvents.onError
      })
   }

   renderLegend(content) {

      const legend = content.hasOwnProperty('legend')
      const button = content.hasOwnProperty('button')

      return content.legend == null && content.button == null
         ? null
         : (
            <div className='carousel-legend-wrapper'>
               {content.legend != null &&
                  <span className='carousel-legend'>
                     {content.legend}
                  </span>
               }
               {content.button != null &&
                  <OutcomeButtonUI label={content.button} selected={false} />
               }
            </div>
         )
   }

   renderItems() {
      return this.state.carouselItems.map((item, index) => {

         let style = {};

         if (this.props.animationType === 'fade') {
            style = {
               left: `${-index * 100}%`,
               opacity: 0.2,
               zIndex: -1,
               transition: `opacity ${this.props.transitionDuration}ms ${this.props.cssEase}`
            }

            if (this.state.currentPosition === index) {
               style = Object.assign({}, style, {
                  opacity: 1,
                  zIndex: 1,
               })
            }
         }

         const redirectMarkup = this.props.redirectCallback != null
            ? (
               <div className='pseudo-anchor' onClick={() => this.props.redirectCallback(item.redirectUrl)}>
                  {this.renderImage(item, index)}
                  {this.renderLegend(item)}
               </div>
            )
            : (
               <a href={item.redirectUrl} target='_blank'>
                  {this.renderImage(item, index)}
                  {this.renderLegend(item)}
               </a>
            )

         return (
            <li
               key={`item-${index}`}
               className={this.state.currentPosition === index ? 'carousel-item selected' : 'carousel-item'}
               id={`item-${index}`}
               ref={el => this[`item${index}`] = el}
               style={style}
               onClick={() => this.props.onCarouselItemClick(item.id)}
            >
               { redirectMarkup }
            </li>
         )
      })
   }

   render () {
      return (
         <div className={this.props.wrapperClassName} ref={el => this.carouselWrapper = el}>
            <div
               className='carousel-wrapper'
               style={{ width: this.props.width, height: `${this.props.height}px` }}
            >
               <div className='slider-wrapper'>
                  <ul className='slider' style={this.state.cssAnimation}>
                     {/* Render Carousel Items */}
                     {this.state.carouselItems != null && this.renderItems()}
                  </ul>
               </div>
            </div>
         </div>
      )
   }
}

Carousel.defaultProps = {
   showIndicators: true,
   showArrows: true,
   infiniteLoop: true,
   legendClassName: null,
   wrapperClassName: null,
   cssEase: 'ease',
   animationType: 'slide',
   selectedItem: 0,
   width: '100%',
   height: 0,
   autoPlay: true,
   stopOnHover: true,
   intervalDuration: 3500,
   transitionDuration: 800,
   carouselItemsArray: null,
   redirectCallback: null,
   onCarouselChange: () => {},
   onCarouselItemClick: () => {},
   initializedCarousel: () => {},
}

Carousel.propTypes = {
   children: PropTypes.node,
   showIndicators: PropTypes.bool,
   showArrows: PropTypes.bool,
   infiniteLoop: PropTypes.bool,
   legendClassName: PropTypes.string,
   wrapperClassName: PropTypes.string,
   cssEase: PropTypes.string,
   animationType: PropTypes.oneOf(['fade', 'slide']),
   selectedItem: PropTypes.number,
   width: PropTypes.string,
   height: PropTypes.number,
   autoPlay: PropTypes.bool,
   stopOnHover: PropTypes.bool,
   intervalDuration: PropTypes.number,
   transitionDuration: PropTypes.number,
   carouselItemsArray: PropTypes.arrayOf(
      PropTypes.shape({
         imagePath: PropTypes.string,
         imagePositionX: PropTypes.oneOf(['left', 'right', 'center']),
         imagePositionY: PropTypes.oneOf(['top', 'bottom', 'center']),
         legend: PropTypes.string,
         button: PropTypes.string,
         redirectUrl: PropTypes.string
      })
   ),
   redirectCallback: PropTypes.func,
   onCarouselChange: PropTypes.func,
   onCarouselItemClick: PropTypes.func,
   initializedCarousel: PropTypes.func,
};

Carousel.displayName = 'Carousel'

export default Carousel;
