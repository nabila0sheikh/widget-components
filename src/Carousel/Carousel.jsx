import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types'
import { widgetModule } from 'kambi-widget-core-library';
import styles from './Carousel.scss'

import CarouselItem from './CarouselItem';

const getImageHeight = (image) => {
   return (image.height / image.width) * window.innerWidth;
}


class Carousel extends Component {

   constructor(props) {
      super(props);
      this.timer;

      const { children } = this.props;

      if (!children || children.length === 0) {
         console.warn('No children warning');
         return null
      }

      const newChildren = [...children, children[0]]

      this.state = {
         isMouseEntered: false,
         currentPosition: props.selectedItem,
         lastPosition: newChildren.length - 1,
         carouselItems: newChildren,
         cssAnimation: {},
         initialized: false,
         itemSize: 0
      }

   }

   componentDidMount() {
      if (!this.props.children) return

      this.setupCarousel()

      if (this.props.autoPlay) {
         this.setupAutoPlay()
      }
   }

   componentDidUpdate(prevProps) {
      this.adaptHeight()
   }

   setupCarousel() {
      this.bindEvents()

      this.setState({
         initialized: true
      }, () => console.log('Carousel is initialized'))

      const item = this.refs[`item${this.state.currentPosition}`]
      const images = item && item.getElementsByTagName('img')
      const initialImage = images && images[this.state.currentPosition]

      if (initialImage) {
         initialImage.addEventListener('load', () => this.adaptHeight())
      }
   }

   bindEvents() {
      window.addEventListener('resize', () => {
         clearTimeout(this.resizeTimeout);
         this.resizeTimeout = setTimeout(() => this.adaptHeight(), 200);
      });
   }

   updateSizes() {
      if (!this.state.initialized) return

      const firstItem = this.refs.item0
      const width = firstItem.clientWidth
      const height = firstItem.clientHeight

      widgetModule.adaptWidgetHeight(
         (height / width) * window.innerWidth
      )

   }

   adaptHeight() {
      const item = this.refs[`item${this.state.currentPosition}`]
      const images = item && item.getElementsByTagName('img')

      if (images.length <= 0) {
         return null
      }

      const image = images[0];

      if (!image.complete) {
         // Image has not yet loaded need to handle this here
         const onImgLoad = () => {
            this.forceUpdate();
            image.removeEventListener('load', onImgLoad)
         }

         image.addEventListener('load', onImgLoad)
      }

      const height = image.clientHeight;
      const width = image.clientWidth;

      widgetModule.adaptWidgetHeight(
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
      if (!this.props.autoPlay) { return }

      this.timer = setTimeout(() => {
         this.increment()
      }, this.props.intervalDuration)
   }

   clearAutoPlay() {
      if (!this.props.autoPlay) { return }

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
            className={this.state.currentPosition === index ? 'carousel-item--active' : 'carousel-item'}
            id={`item-${index}`}
            ref={`item${index}`}
         >
            {child}
         </li>
      ))
   }

   render () {
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
   carouselItems: null, // [{ item: 'blah', }]
   redirectURL: null,
   redirectCallback: () => {},
   onSlide: (currentPos) => { }
}

Carousel.propTypes = {
   children: PropTypes.node.isRequired
};

Carousel.displayName = 'Carousel'

export default Carousel;
