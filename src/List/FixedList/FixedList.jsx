import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';
import styles from './FixedList.scss';
import ItemContainer from '../ItemContainer';

/**
 * Horizontal list component. Items will be stretched or shrunken to fit the container.
 * @memberOf widget-components
 */
class FixedList extends Component {

   /*
    * Constructs.
    * @param {object} props Component properties
    */
   constructor(props) {
      super(props);
      this.state = {
         selected: props.selected
      };
   }

   /*
    * Switches to given tab.
    * @param {number} idx Tab index
    */
   onItemClick(idx) {
      if (this.props.onItemClick) {
         this.props.onItemClick(idx);
      }

      this.setState({ selected: idx });
   }

   /*
    * Renders component.
    * @returns {XML}
    */
   render() {
      return (
         <div className={styles.bar}>
            {Children.map(this.props.children, (child, i) => this.props.renderItemContainer({
               key: i,
               selected: this.state.selected == i,
               onClick: this.onItemClick.bind(this, i),
               children: child
            }))}
         </div>
      );
   }
}

/**
 * @callback FixedList_RenderItemContainer
 * @param {FixedList_RenderItemContainerArgs} args Contains properties which will control the container
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
 * @name FixedList_RenderItemContainerArgs
 * @property {boolean} selected Controls whether item should be rendered as currently selected or normally
 * @property {function} onClick Called once item has been clicked
 * @property {function} onWidth Called when item width is determined or has been changed
 * @property {ReactElement} children Item contents
 */

/**
 * @property [children] {ReactElement[]} Items list
 * @property [onItemClick] {function(number)} Item click handler. Called with item index argument.
 * @property [selected=0] {number} Initially selected item index
 * @property [renderItemContainer] {FixedList_RenderItemContainer} Function capable of rendering item container. Renders Kambi-styled item container by default.
 */
FixedList.propTypes = {
   children: PropTypes.node,
   onItemClick: PropTypes.func,
   selected: PropTypes.number,
   renderItemContainer: PropTypes.func
};

FixedList.defaultProps = {
   selected: 0,
   renderItemContainer: args =>
      <ItemContainer {...args}>
         {args.children}
      </ItemContainer>
};

export default FixedList;
