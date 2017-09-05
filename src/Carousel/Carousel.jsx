import React, { Component, cloneElement, Children } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import styles from './Carousel.scss';
import OutcomeButtonUI from '../OutcomeButton/OutcomeButtonUI'

const checkImage = (path, index) => {
   return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(path)
      img.onerror = () => {
         console.log(`Image ${index} failed to load`);
         // TODO perhaps handle removing image from carousel array???
         // we don't need to reject and break the promise.all with reject()
         resolve()
      }
      img.src = path
   })
}

class Carousel extends Component {

   constructor(props) {
      super(props);
      this.timer;
      this.changeTimer;

      this.state = {
         isMouseEntered: false,
         currentPosition: props.selectedItem,
         lastPosition: null,
         carouselItems: null,
         cssAnimation: {},
         initialized: false,
      }
   }

   componentDidMount() {
      if ((this.props.items == null || this.props.items.length < 1) && this.props.children == null) {
         return;
      }
      this.setupCarousel()
   }

   componentDidUpdate() {
      if (!this.state.initialized) {
         this.setupCarousel()
      }
   }

   componentWillUnmount() {
      clearTimeout(this.changeTimer)
   }

   setupCarousel() {

      this.setupCarouselItems()

      if (this.props.autoPlay) {
         this.setupAutoPlay()
      }

      this.setState({
         initialized: true
      }, () => this.props.initializedCarousel(true))
   }

   setupCarouselItems() {
      if (!this.props.children) {
         const itemsArray = this.props.items

         if (itemsArray != null && Array.isArray(itemsArray)) {
            const items = [...itemsArray, itemsArray[0]]

            const images = itemsArray.map(item => item.imagePath)

            Promise.all(images.map(checkImage))
            .then(() => {
               this.props.imagesLoaded()
               this.setState({
                  carouselItems: items,
                  lastPosition: items.length - 1
               })
            })
            .catch((e) => {
               console.log(e);
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

   setupAutoPlay() {

      this.autoPlay()
      const carouselWrapper = this.carouselWrapper

      if (this.props.stopOnHover && carouselWrapper) {
         // Stop mobile propagation
         // Required so touch/tap events don't cause mouseEnter/mouseLeave to fire
         let mobileTouch = false;

         carouselWrapper.addEventListener('touchstart', (ev) => {
            mobileTouch = true;
         }, true)

         carouselWrapper.addEventListener('touchend', (ev) => {
            mobileTouch = false;
         }, true)

         carouselWrapper.addEventListener('mouseenter', (ev) => {
            if (!mobileTouch) {
               this.stopOnHover()
            }
         })

         carouselWrapper.addEventListener('mouseleave', (ev) => {
            if (!mobileTouch) {
               this.startOnHoverLeave()
            }
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
      this.props.onCarouselMouseEnter(Date.now(), this.state.carouselItems[this.state.currentPosition].itemId)
      this.clearAutoPlay()
   }

   startOnHoverLeave() {
      this.setState({ isMouseEntered: false })
      this.props.onCarouselMouseLeave(Date.now(), this.state.carouselItems[this.state.currentPosition].itemId)
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

         this.changeTimer = setTimeout(() => {
            this.props.onCarouselChange(this.state.currentPosition)
         }, this.props.transitionDuration)


      } else {

         console.error(`You used the animation value ${this.props.animationType} which is not currently supported by the carousel. Please use one of 'slide' or 'fade'.`)

      }
   }



   renderImage(item, index) {
      if (item.hasOwnProperty('imagePath')) {
         const styleObject = {
            backgroundPosition: `${item.imagePositionX} ${item.imagePositionY}`,
            backgroundImage: `url(${item.imagePath})`,
            backgroundSize: item.backgroundSize,
            backgroundRepeat: 'no-repeat',
            width: '100%',
            height: '100%'
         }

         return (
            <div
               className='img'
               style={styleObject}
            />
         )
      }
   }

   renderLegend(content) {

      const legend = content.hasOwnProperty('legend')
      const button = content.hasOwnProperty('button')

      if ((legend || button) && (content.legend != null || content.button != null)) {
         let legend = null;

         if (content.legend != null) {
            if (React.isValidElement(content.legend)) {
               legend = content.legend
            } else if (typeof content.legend === 'string') {
               legend = <span className="carousel-legend">{content.legend}</span>
            }
         }

         return (
            <div className='carousel-legend-wrapper'>
               {legend != null && legend}
               {content.button != null &&
                  <OutcomeButtonUI label={content.button} selected={false} />
               }
            </div>
         )
      } else {
         return null
      }
   }

   itemStyles(index) {
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

      return style
   }

   item(id, index, content) {
      return (
         <li
            key={`item-${index}`}
            className={this.state.currentPosition === index ? 'carousel-item selected' : 'carousel-item'}
            id={`item-${index}`}
            ref={el => this[`item${index}`] = el}
            style={this.itemStyles(index)}
            onClick={() => this.props.onCarouselItemClick(id)}
         >
            { content }
         </li>
      )
   }

   renderItems() {
      return this.state.carouselItems.map((item, index) => {

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

         return this.item(item.itemId, index, redirectMarkup)
      })
   }

   renderChildren() {
      return this.state.carouselItems.map((item, index) => {
         this.cloneImageTag(item);
         return this.item(index, index, item)
      })
   }

   checkItems() {
      if (this.props.children == null || this.props.children.length < 1) {
         return this.renderItems()
      } else {
         return this.renderChildren()
      }
   }

   render () {

      const height = this.state.carouselItems != null
         ? `${this.props.height}px`
         : '0px'

      let sliderStyle;
      if (this.props.animationType === 'fade') {
         sliderStyle = {
            transform: 'translate3d(0%, 0, 0)'
         }
      } else {
         sliderStyle = this.state.cssAnimation
      }

      return (
         <div className={this.props.wrapperClassName} ref={el => this.carouselWrapper = el}>
            <div
               className='carousel-wrapper'
               style={{ width: '100%', height }}
            >
               <div className='slider-wrapper'>
                  <ul className='slider' style={sliderStyle}>
                     {/* Render Carousel Items */}
                     {this.state.carouselItems != null && this.checkItems()}
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
   height: 0,
   autoPlay: true,
   stopOnHover: true,
   intervalDuration: 3500,
   transitionDuration: 800,
   items: null,
   redirectCallback: null,
   onCarouselChange: () => {},
   onCarouselMouseEnter: () => {},
   onCarouselMouseLeave: () => {},
   onCarouselItemClick: () => {},
   initializedCarousel: () => {},
   imageLoaded: () => {}
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
   height: PropTypes.number,
   autoPlay: PropTypes.bool,
   stopOnHover: PropTypes.bool,
   intervalDuration: PropTypes.number,
   transitionDuration: PropTypes.number,
   items: PropTypes.arrayOf(
      PropTypes.shape({
         imagePath: PropTypes.string,
         imagePositionX: PropTypes.oneOf(['left', 'right', 'center']),
         imagePositionY: PropTypes.oneOf(['top', 'bottom', 'center']),
         backgroundSize: PropTypes.oneOf(['contain', 'cover']),
         legend: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
         button: PropTypes.string,
         redirectUrl: PropTypes.string,
         itemId: PropTypes.number
      })
   ),
   redirectCallback: PropTypes.func,
   onCarouselChange: PropTypes.func,
   onCarouselItemClick: PropTypes.func,
   onCarouselMouseEnter: PropTypes.func,
   onCarouselMouseLeave: PropTypes.func,
   initializedCarousel: PropTypes.func,
   imagesLoaded: PropTypes.func
};

Carousel.displayName = 'Carousel'

export default Carousel;
