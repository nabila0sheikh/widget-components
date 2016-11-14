import React, { Component, PropTypes } from 'react';
import styles from './TabPagination.scss';
import TabBarFixed from './TabBarFixed';
import TabBarScrolled from './TabBarScrolled';

/**
 * Tab Pagination component
 */
class TabPagination extends Component {

   /**
    * Constructs.
    * @param {object} props Component properties
    */
   constructor(props) {
      super(props);

      this.state = {
         selected: this.props.selected
      };

      this.switchTab = this.switchTab.bind(this);
   }

   /**
    * Switches to given tab.
    * @param {number} idx Tab index
    */
   switchTab(idx) {
      this.setState({ selected: idx });
   }

   /**
    * Creates TabPagination markup.
    * @returns {XML}
    */
   render() {
      return (
         <div className={styles.general}>
            {this.props.fixedWidth &&
               <TabBarFixed onTabSwitch={this.switchTab} selected={this.state.selected}>
                  {this.props.children.map((a, i) => this.props.renderTab(i))}
               </TabBarFixed>}
            {!this.props.fixedWidth &&
               <TabBarScrolled onTabSwitch={this.switchTab} selected={this.state.selected}>
                  {this.props.children.map((a, i) => this.props.renderTab(i))}
               </TabBarScrolled>}
            <div className={styles.content}>
               {this.props.children[this.state.selected]}
            </div>
         </div>
      );
   }
}

TabPagination.propTypes = {
   /**
    * Tab content elements
    */
   children: PropTypes.arrayOf(PropTypes.element),

   /**
    * Function called in order to render single tab on tab bar
    */
   renderTab: PropTypes.func,

   /**
    * Tab bar display option:
    * true - all tabs will be squeezed/stretched to fit tab bar width
    * false - scroll bar will be displayed when tabs exceed tab bar width
    */
   fixedWidth: PropTypes.bool,

   /**
    * Currently selected tab
    */
   selected: PropTypes.number
};

TabPagination.defaultProps = {
   fixedWidth: false,
   renderTab: idx => <div key={idx}><strong>{idx}</strong></div>,
   selected: 0
};

export default TabPagination;
