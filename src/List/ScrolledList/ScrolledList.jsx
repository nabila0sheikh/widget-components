import React, { Children, Component, PropTypes } from 'react';
import styles from './ScrolledList.scss';
import ArrowButton from './ArrowButton';
import ItemContainer from '../ItemContainer';

/*
 * Window resize handling reflex
 * @type {number}
 */
const RESIZE_SLUGGISHNESS = 200;

/*
 * Will turn off mobile mode if screen is wider than defined below
 * @type {number}
 */
const MOBILE_MAX_SCREEN_WIDTH = 768;

/*
 * Mobile browser check
 * @type {boolean}
 */
const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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

      this.scrollLeft = 0;
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
         this.scrollToItem(this.state.item);
         this.updateItemsAlignment();
      }, RESIZE_SLUGGISHNESS);
   }

   /*
    * Selects item with given index.
    * @param {number} idx Item index
    */
   onItemClick(idx) {
      if (this.props.onItemClick) {
         this.props.onItemClick(idx);
      }

      this.scrollToItem(idx);

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
    * Determines if component is running on mobile device.
    * @returns {boolean}
    */
   get mobileDevice() {
      const hasTouchStart = 'ontouchstart' in window;

      if (!this.containerWidth) {
         return hasTouchStart && isMobileBrowser;
      }

      return this.containerWidth <= MOBILE_MAX_SCREEN_WIDTH && hasTouchStart && isMobileBrowser;
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

   updateItemsAlignment() {
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
      if (!(this.bar && this.maxScrollLeft && this.eyeshotWidth && this.eyeshot)) {
         return;
      }

      this.scrollLeft = offset > this.maxScrollLeft ? this.maxScrollLeft : offset;
      this.scrollLeft = this.scrollLeft < 0 ? 0 : this.scrollLeft;

      if (this.mobileDevice) {
         this.eyeshot.scrollLeft = this.scrollLeft;
         this.translateX = 0;
      } else {
         this.translateX = -1 * this.scrollLeft;
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
   }

   /*
    * Scrolls bar to given item.
    * @param {number} item Item index
    */
   scrollToItem(item) {
      if (!(this.bar && this.eyeshotWidth)) {
         return;
      }

      this.scrollTo(this.computeItemsWidth(0, item) - (this.eyeshotWidth - this.computeItemsWidth(item)) / 2);
   }

   /*
    * Should prev button be shown
    * @returns {boolean}
    */
   get showPrevButton() {
      return !this.mobileDevice && this.scrollLeft > 0;
   }

   /*
    * Should next button be shown
    * @returns {boolean}
    */
   get showNextButton() {
      return !this.mobileDevice && this.scrollLeft < this.maxScrollLeft;
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
      this.scrollTo(this.scrollLeft - this.props.step * this.averageItemWidth);
   }

   /*
    * Scrolls list to next page.
    */
   nextPage() {
      this.scrollTo(this.scrollLeft + this.props.step * this.averageItemWidth);
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
            {this.props.renderPrevButton({
               onClick: this.prevPage,
               disabled: !this.showPrevButton
            })}
            {this.props.renderNextButton({
               onClick: this.nextPage,
               disabled: !this.showNextButton
            })}
         </div>
      );
   }
}

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

ScrolledList.ALIGN_ITEMS = ALIGN_ITEMS;

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
 */
ScrolledList.propTypes = {
   children: PropTypes.node,
   onItemClick: PropTypes.func,
   selected: PropTypes.number,
   step: PropTypes.number,
   alignItems: PropTypes.oneOf(Object.keys(ScrolledList.ALIGN_ITEMS).map(k => ScrolledList.ALIGN_ITEMS[k])),
   renderPrevButton: PropTypes.func,
   renderNextButton: PropTypes.func,
   renderItemContainer: PropTypes.func
};

ScrolledList.defaultProps = {
   selected: 0,
   step: 2,
   alignItems: ScrolledList.ALIGN_ITEMS.CENTER,
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
