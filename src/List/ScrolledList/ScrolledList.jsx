import React, { Children, Component, PropTypes } from 'react';
import styles from './ScrolledList.scss';
import ArrowButton from './ArrowButton';
import ItemContainer from '../ItemContainer';

/*
 * Window resize handling reflex (in milliseconds)
 * @type {number}
 */
const RESIZE_MOMENTUM = 200;


/*
 * Duration of bar element scrollLeft animation (in milliseconds)
 * @type {number}
 */
const BAR_TRANSITION_DURATION = 300;

/*
 * Will turn off mobile mode if screen is wider than defined below (in pixels)
 * @type {number}
 */
const MOBILE_MAX_SCREEN_WIDTH = 768;

/**
 * Items alignment constants
 * @enum {string}
 * @readonly
 * @example
 * <ScrolledList alignItems={ScrolledList.ALIGN_ITEMS.SPACE_BETWEEN}>...</ScrolledList>
 */
const ALIGN_ITEMS = {
   /**
    * List items will be aligned to the left.
    * @member {string}
    */
   LEFT: 'flex-start',

   /**
    * List items will be aligned to the right.
    * @member {string}
    */
   RIGHT: 'flex-end',

   /**
    * List items will be centered.
    * @member {string}
    */
   CENTER: 'center',

   /**
    * There will be space around all items.
    * @member {string}
    */
   SPACE_AROUND: 'space-around',

   /**
    * There will be space only between items.
    * @member {string}
    */
   SPACE_BETWEEN: 'space-between'
};

/**
 * Scroll to selected item modes
 * @enum {string}
 * @readonly
 * @example
 * <ScrolledList scrollToItemMode={ScrolledList.SCROLL_TO_ITEM_MODE.TO_LEFT}>...</ScrolledList>
 */
const SCROLL_TO_ITEM_MODE = {
   /**
    * Selected item will be the first object on the left side of eye shot
    */
   TO_LEFT: 'to-left',

   /**
    * Selected item will be at the center of eye shot
    */
   CENTER: 'center'
};

/*
 * Mobile browser check
 * @type {boolean}
 */
const isMobileBrowser = function() {
   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/*
 * Performs animation on given element's property.
 * @param {HTMLElement} element Element to animate
 * @param {string} property Element's property to animate
 * @param {number} value Target property value
 * @param {number} duration Animation duration
 */
const animate = function(element, property, value, duration) {
   const requestAnimationFrame = window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         (callback => setTimeout(() => callback(Date.now()), duration));

   let start = null;

   const initial = element[property],
      delta = value - initial;

   const step = function(timestamp) {
      if (!start) {
         start = timestamp;
      }

      let progress = (timestamp - start) / duration;

      if (progress > 1) {
         progress = 1;
      }

      // easeOutQuad
      element[property] = -delta * progress * (progress - 2) + initial;

      if (progress < 1) {
         requestAnimationFrame(step);
      }
   };

   requestAnimationFrame(step);
};

/**
 * Horizontal scrolled list component.
 * If items won't fit the container the list will be scrolled. Otherwise if items take less space
 * than the container they will be aligned according to [alignItems]{@link widget-components.ScrolledList.propTypes} property.
 * @memberOf widget-components
 */
class ScrolledList extends Component {

   /*
    * Constructs.
    * @param {object} props Component properties
    */
   constructor(props) {
      super(props);

      this.state = {
         item: props.selected
      };

      this.translateXValue = 0;
      this.itemWidths = [];

      this.prevPage = this.prevPage.bind(this);
      this.nextPage = this.nextPage.bind(this);
      this.onResize = this.onResize.bind(this);
   }

   /*
    * Called after component rendering to DOM.
    */
   componentDidMount() {
      window.addEventListener('resize', this.onResize);
      this.scrollToItem(this.state.item);
      this.updateItemsAlignment();
   }

   /*
    * Called on external props change.
    */
   componentWillReceiveProps(nextProps) {
      this.scrollToItem(nextProps.selected);
   }

   /*
    * Called before removing component.
    */
   componentWillUnmount() {
      window.removeEventListener('resize', this.onResize);
   }

   /*
    * Handles window resize
    */
   onResize() {
      if (this.resizeTimeout) {
         clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
         this.updateItemsAlignment();
         this.scrollTo(this.currentScrollLeft);
      }, RESIZE_MOMENTUM);
   }

   /*
    * Selects item with given index.
    * @param {number} idx Item index
    */
   onItemClick(idx) {
      if (this.props.onItemClick) {
         this.props.onItemClick(idx);
      }

      this.setState({ item: idx });
   }

   /*
    * Updates internal state with item's width and re-renders view if necessary.
    * @param {number} idx Item index
    * @param {number?} width Desired item width
    */
   setItemWidth(idx, width) {
      if (typeof width !== 'number') {
         return;
      }

      if (this.itemWidths[idx] !== width) {
         this.itemWidths[idx] = width;
         this.forceUpdate();
      }
   }

   /*
    * Current scroll left offset (in pixels).
    */
   get currentScrollLeft() {
      if (this.mobileDevice) {
         return this.eyeshot.scrollLeft || 0;
      } else {
         return -1 * this.translateX;
      }
   }

   /*
    * Determines if component is running on mobile device.
    * @returns {boolean}
    */
   get mobileDevice() {
      const hasTouchStart = 'ontouchstart' in window;

      if (!this.containerWidth) {
         return hasTouchStart && isMobileBrowser();
      }

      return this.containerWidth <= MOBILE_MAX_SCREEN_WIDTH && hasTouchStart && isMobileBrowser();
   }

   /*
    * Whole component's width.
    * @returns {number}
    */
   get containerWidth() {
      return this.container ? this.container.offsetWidth : null;
   }

   /*
    * Field of view width.
    * @returns {number|null}
    */
   get eyeshotWidth() {
      return this.eyeshot ? this.eyeshot.offsetWidth : null;
   }

   /*
    * Returns maximal scroll left offset.
    * @returns {number|null}
    */
   get maxScrollLeft() {
      if (!(this.eyeshotWidth)) {
         return null;
      }

      return this.computeItemsWidth(0, Children.count(this.props.children) - 1) - this.eyeshotWidth;
   }

   /*
    * Updates items alignment if they take less space than container width.
    */
   updateItemsAlignment() {
      if (!this.bar) {
         return;
      }

      const itemsWidth = this.computeItemsWidth(0, Children.count(this.props.children) - 1);

      if (itemsWidth < this.eyeshotWidth) {
         this.bar.style.justifyContent = this.props.alignItems;
      } else {
         this.bar.style.justifyContent = '';
      }
   }

   /*
    * Scrolls list to given offset.
    * @param {number} offset Scroll offset
    */
   scrollTo(offset) {
      if (!(this.bar && this.maxScrollLeft && this.eyeshot)) {
         return;
      }

      offset = Math.round(offset);

      let scrollLeft = offset > this.maxScrollLeft ? this.maxScrollLeft : offset;
      scrollLeft = scrollLeft < 0 ? 0 : scrollLeft;

      if (this.mobileDevice) {
         if (scrollLeft == this.currentScrollLeft) {
            return;
         }

         animate(this.eyeshot, 'scrollLeft', scrollLeft, BAR_TRANSITION_DURATION);
      } else {
         this.translateX = -1 * scrollLeft;
         this.eyeshot.scrollLeft = 0;
      }

      this.forceUpdate();
   }

   /*
    * Translates bar element by given offset.
    * @param {number} offsetX X axis offset
    */
   set translateX(offsetX) {
      const transform = `translate3d(${offsetX}px, 0, 0)`;
      this.bar.style.transform = transform;
      this.bar.style.webkitTransform = transform;
      this.bar.style.mozTransform = transform;
      this.translateXValue = offsetX;
   }

   /*
    * Returns current bar element translation along x-axis.
    * @returns {number}
    */
   get translateX() {
      return this.translateXValue;
   }

   /*
    * Scrolls bar to given item.
    * @param {number} item Item index
    *
    * Example for item=2
    *
    * computeItemsWidth(0, item - 1)
    * <--------------------------->
    *
    *                           computeItemsWidth(item)
    *                             <----------------->
    *
    *                         /=========================\
    * /-----------------------#-------------------------#-------------------------------\
    * |         |             #   |                 |   #             |                 |
    * |    0    |        1    #   |        2        |   #    3        |        4        |
    * |         |             #   |                 |   #             |                 |
    * \-----------------------#-------------------------#-------------------------------/
    *                         \=========================/
    *
    *                         <------ eyeshotWidth ----->
    */
   scrollToItem(item) {
      if (!(this.bar && this.eyeshotWidth)) {
         return;
      }

      switch (this.props.scrollToItemMode) {
         case SCROLL_TO_ITEM_MODE.TO_LEFT:
            this.scrollTo(item ? this.computeItemsWidth(0, item - 1) : 0);
            break;

         case SCROLL_TO_ITEM_MODE.CENTER:
         default:
            this.scrollTo((item ? this.computeItemsWidth(0, item - 1) : 0) - (this.eyeshotWidth - this.computeItemsWidth(item)) / 2);
      }

   }

   /*
    * Should prev button be shown
    * @returns {boolean}
    */
   get showPrevButton() {
      return this.currentScrollLeft > 0;
   }

   /*
    * Should next button be shown
    * @returns {boolean}
    */
   get showNextButton() {
      return this.currentScrollLeft < this.maxScrollLeft;
   }

   /*
    * Returns item widths sum for given range.
    * @param {number} start First item index
    * @param {number} end Last item index
    * @returns {number}
    */
   computeItemsWidth(start, end = start) {
      return this.itemWidths
         .slice(start, end + 1)
         .reduce((sum, itemWidth) => sum + (itemWidth ? itemWidth : 0), 0);
   }

   /*
    * Computes average item width across all items.
    * @returns {number}
    */
   get averageItemWidth() {
      return this.computeItemsWidth(0, Children.count(this.props.children) - 1) / Children.count(this.props.children);
   }

   /*
    * Scrolls list to previous page.
    */
   prevPage() {
      this.scrollTo(this.currentScrollLeft - this.props.step * this.averageItemWidth);
   }

   /*
    * Scrolls list to next page.
    */
   nextPage() {
      this.scrollTo(this.currentScrollLeft + this.props.step * this.averageItemWidth);
   }

   /*
    * Renders scrolled item list.
    * @returns {XML}
    */
   render() {
      return (
         <div
            className={`${styles.container} ${this.mobileDevice ? 'mobile-device' : ''}`}
            ref={el => (this.container = el)}
         >
            <div
               className={styles.eyeshot}
               ref={el => (this.eyeshot = el)}
            >
               <div
                  className={styles.bar}
                  ref={el => (this.bar = el)}
               >
                  {Children.map(this.props.children, (child, i) => this.props.renderItemContainer({
                     key: i,
                     selected: this.state.item == i,
                     onClick: this.onItemClick.bind(this, i),
                     onWidth: this.setItemWidth.bind(this, i),
                     children: child
                  }))}
               </div>
            </div>
            { !this.mobileDevice &&
               this.props.renderPrevButton({
                  onClick: this.prevPage,
                  disabled: !this.showPrevButton
               })
            }
            { !this.mobileDevice &&
               this.props.renderNextButton({
                  onClick: this.nextPage,
                  disabled: !this.showNextButton
               })
            }
         </div>
      );
   }
}

ScrolledList.ALIGN_ITEMS = ALIGN_ITEMS;
ScrolledList.SCROLL_TO_ITEM_MODE = SCROLL_TO_ITEM_MODE;

/**
 * Should return rendered prev/next scroll button.
 * @callback ScrolledList_RenderButton
 * @param {ScrolledList_RenderButtonArgs} args Contains properties which will control the button
 * @returns ReactElement
 *
 * @example <caption>Using custom button for next/prev.</caption>
 *    ({onClick, disabled}) => <CustomButton onClick={onClick} disabled={disabled} />
 *
 * @example <caption>Shorthand syntax can be used once function arguments and component properties names match.</caption>
 *    args => <CustomButton {...args} />
 */

/**
 * @name ScrolledList_RenderButtonArgs
 * @property {function} onClick Click handler
 * @property {boolean} disabled Controls whether button should be rendered as disabled or not
 */

/**
 * Should return rendered item container.
 * Container is responsible for receiving clicks, properly rendering selected state and optionally hover.
 * @callback ScrolledList_RenderItemContainer
 * @param {ScrolledList_RenderItemContainerArgs} args Container properties which will control the container
 * @returns ReactElement
 *
 * @example <caption>Using custom item container</caption>
 *    ({selected, onClick, onWidth, children}) =>
 *       <CustomItemContainer
 *          selected={selected}
 *          onClick={onClick}
 *          onWidth={onWidth}>
 *             {children}
 *       </CustomItemContainer>
 *
 * @example <caption>Shorthand syntax can be used once function arguments and component properties names match.</caption>
 *    args => <CustomItemContainer {...args}>{args.children}</CustomItemContainer>
 */

/**
 * @name ScrolledList_RenderItemContainerArgs
 * @property {boolean} selected Controls whether item should be rendered as currently selected or normally
 * @property {function} onClick Called once item has been clicked
 * @property {function} onWidth Called when item width is determined or has been changed
 * @property {ReactElement} children Item contents
 */

/**
 * @property [children] {ReactElement[]} Items list
 * @property [onItemClick] {function(number)} Item click handler. Called with item index argument.
 * @property [selected=0] {number} Initially selected item index
 * @property [step=2] {number} Scroll step (items count)
 * @property [alignItems=CENTER] {ALIGN_ITEMS} Method of aligning items when they take less width than the container has
 * @property [renderPrevButton] {ScrolledList_RenderButton} Function capable of rendering button responsible for scrolling left. Renders left arrow button by default.
 * @property [renderNextButton] {ScrolledList_RenderButton} Function capable of rendering button responsible for scrolling right. Renders right arrow button by default.
 * @property [renderItemContainer] {ScrolledList_RenderItemContainer} Function capable of rendering item container. Renders Kambi-styled item container by default.
 * @property [scrollToItemMode=CENTER] {SCROLL_TO_ITEM_MODE} Scroll to selected item mode
 */
ScrolledList.propTypes = {
   children: PropTypes.node,
   onItemClick: PropTypes.func,
   selected: PropTypes.number,
   step: PropTypes.number,
   alignItems: PropTypes.oneOf(Object.keys(ALIGN_ITEMS).map(k => ALIGN_ITEMS[k])),
   renderPrevButton: PropTypes.func,
   renderNextButton: PropTypes.func,
   renderItemContainer: PropTypes.func,
   scrollToItemMode: PropTypes.oneOf(Object.keys(SCROLL_TO_ITEM_MODE).map(k => SCROLL_TO_ITEM_MODE[k]))
};

ScrolledList.defaultProps = {
   selected: 0,
   step: 2,
   alignItems: ScrolledList.ALIGN_ITEMS.CENTER,
   scrollToItemMode: ScrolledList.SCROLL_TO_ITEM_MODE.CENTER,
   renderPrevButton: props =>
      <ArrowButton type='left' {...props} />,
   renderNextButton: props =>
      <ArrowButton type='right' {...props} />,
   renderItemContainer: args =>
      <ItemContainer {...args}>
         {args.children}
      </ItemContainer>
};

export default ScrolledList;
