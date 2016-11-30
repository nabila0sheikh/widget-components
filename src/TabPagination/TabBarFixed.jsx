import React, { Component, PropTypes } from 'react';
import styles from './TabBarFixed.scss';
import TabContainer from './TabContainer';

/**
 * Fixed width Tab Bar component
 */
class TabBarFixed extends Component {

   /**
    * Constructs.
    * @param {object} props Component properties
    */
   constructor(props) {
      super(props);
      this.state = {
         selected: props.selected
      };
   }

   /**
    * Switches to given tab.
    * @param {number} idx Tab index
    */
   onTabClick(idx) {
      if (this.props.onTabSwitch) {
         this.props.onTabSwitch(idx);
      }

      this.setState({ selected: idx });
   }

   /**
    * Renders component.
    * @returns {XML}
    */
   render() {
      return (
         <div className={styles.bar}>
            {this.props.children.map((child, i) => this.props.renderTabContainer({
               key: i,
               selected: this.state.selected == i,
               onClick: this.onTabClick.bind(this, i),
               children: child
            }))}
         </div>
      );
   }
}

TabBarFixed.propTypes = {
   /**
    * Tab element
    */
   children: PropTypes.arrayOf(PropTypes.element).isRequired,

   /**
    * Tab clicked handler
    */
   onTabSwitch: PropTypes.func,

   /**
    * Selected tab index
    */
   selected: PropTypes.number,

   /**
    * Function capable of rendering tab container
    */
   renderTabContainer: PropTypes.func
};

TabBarFixed.defaultProps = {
   selected: 0,
   renderTabContainer: (props) => <TabContainer {...props}>{props.children}</TabContainer>
};

export default TabBarFixed;
