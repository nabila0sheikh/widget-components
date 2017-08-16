import React, { Component } from 'react';
import createFragment from 'react-addons-create-fragment'
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types'
import { widgetModule } from 'kambi-widget-core-library';
import styles from './Carousel.scss'

const imgPromise = (url) => {
   return new Promise((resolve, reject) => {
      const imageElem = new Image()

      imageElem.onload = () => resolve(imageElem)
      imageElem.onerror = () => reject('The image failed to load')

      imageElem.src = url
   })
}

const carouselItemsPromise = (items) => {
   if (!items.every(item => typeof item === 'object')) {
      console.error('Property carouselItemsArray should contain objects')
      return
   }

   return Promise.all(
      items.map((item) => {
         if (item.hasOwnProperty('imagePath')) {
            return imgPromise(item.imagePath)
         }
      })
   ).then(([...items]) => {
      return items;
   })
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
         cssAnimation: {},
         initialized: false,
         itemSize: 0
      }
   }

   componentDidMount() {
      this.setupCarousel()
   }

   componentDidUpdate(prevProps) {
      this.adaptHeight()
   }

   setupCarousel() {
      this.bindEvents()
      this.setupCarouselItems()

      this.setState({
         initialized: true
      }, () => console.log('Carousel is initialized'))
   }

   setupCarouselItems() {
      if (!this.props.children) {
         console.warn('No children warning');
         const itemsArray = this.props.carouselItemsArray
         if (itemsArray != null && Array.isArray(itemsArray)) {
            carouselItemsPromise(itemsArray)
               .then((items) => {
                  items = [...items, items[0]]
                  this.setState({
                     carouselItems: items,
                     lastPosition: items.length -1
                  })

                  if (this.props.autoPlay) {
                     this.setupAutoPlay()
                  }
               })
         }
      } else {
         const { children } = this.props;
         const items = [...children, children[0]]
         this.setState({
            carouselItems: items,
            lastPosition: items.length -1
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
      if (this.state.carouselItems == null) return null

      const item = this[`item${this.state.currentPosition}`]
      const images = item && item.getElementsByTagName('img') // returns an array

      if (images.length <= 0) {
         return null
      }

      const image = images[0]; // First image in the array
      // should only be one image as each 'item' === each <li> tag

      // Access the image height and width
      const height = image.clientHeight;
      const width = image.clientWidth;

      // Call setWidgetHeight from widgetModule to set the height of the iframe
      widgetModule.setWidgetHeight(
         // Use height/width * window width to maintain aspect ratio
         (height / width) * window.innerWidth
      )
   }

   setupAutoPlay() {
      this.autoPlay()
      const carouselWrapper = this.carouselWrapper

      if (this.props.stopOnHover && carouselWrapper) {
         carouselWrapper.addEventListener('mouseenter', () => {
            console.log('mouseenter');
            this.stopOnHover()
         })
         carouselWrapper.addEventListener('mouseleave', () => {
            console.log('mouseleave');
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

      this.setState({
         cssAnimation: {
            transform: `translate3d(${currentPosition}, 0, 0)`,
            transition: `${this.props.transitionDuration}ms ${this.props.cssEase}`
         }
      }, () => this.props.onSlide(this.state.currentPosition))

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
   }

   renderItems() {
      return this.state.carouselItems.map((child, index) => (
         <li
            key={`child-${index}`}
            className={this.state.currentPosition === index ? 'carousel-item selected' : 'carousel-item'}
            id={`item-${index}`}
            ref={el => this[`item${index}`] = el}
         >
            <img src={child.src} />
         </li>
      ))
   }

   render () {
      if (this.state.carouselItems == null) {
         return null
      }

      const wrapperStyles = {}


      return (
         <div className={this.props.wrapperClassName} ref={el => this.carouselWrapper = el}>
            <div className='carousel-wrapper' style={{ width: this.props.width }}>
               <div className='slider-wrapper' style={wrapperStyles}>
                  <ul className='slider' style={this.state.cssAnimation}>
                     {/* Render Carousel Items */}
                     {this.renderItems()}
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
   selectedItem: 0,
   width: '100%',
   autoPlay: true,
   stopOnHover: true,
   intervalDuration: 1500,
   transitionDuration: 350,
   carouselItemsArray: null, // [{ item: 'blah', }]
   redirectURL: null,
   redirectCallback: () => {},
   onSlide: (currentPos) => { }
}

Carousel.propTypes = {
   children: PropTypes.node
};

Carousel.displayName = 'Carousel'

export default Carousel;
