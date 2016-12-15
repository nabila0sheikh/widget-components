import React, { Children, Component, PropTypes } from 'react';
import ScrolledList from '../List/ScrolledList/ScrolledList';

/**
 * Tab Pagination component.
 * Component should receive list of tab contents as children.
 * It will render upper tab bar (for switching tabs).
 * Once a tab is clicked a tab content will be switched.
 * @memberOf widget-components
 */
class TabPagination extends Component {

   /*
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

   /*
    * Switches to given tab
    * @param {number} idx Tab index
    */
   switchTab(idx) {
      this.setState({ selected: idx });
   }

   /*
    * Creates TabPagination markup
    * @returns {XML}
    */
   render() {
      const children = Children.toArray(this.props.children);

      return (
         <div>
            {this.props.renderTabList({
               selected: this.state.selected,
               onItemClick: this.switchTab,
               children: this.props.children.map((a, i) => this.props.renderTab(i))
            })}
            <div>
               {children[this.state.selected]}
            </div>
         </div>
      );
   }
}

/**
 * Renders tab for given index. The tab will be placed inside upper tab bar.
 * @callback TabPagination_RenderTab
 * @param {number} idx Tab index
 * @returns ReactElement
 * @example
 *    idx => <div style={{width: 50, height: 50}}>Tab <strong>#{idx}</strong></div>
 */

/**
 * Renders upper tab list.
 * @callback TabPagination_RenderTabList
 * @param {TabPagination_RenderTabListArgs} args Contains properties which will control tab bar behaviour
 * @returns ReactElement
 *
 * @example <caption>Using custom tab bar component</caption>
 *    ({selected, onItemClick, children}) =>
 *       <CustomTabBar
 *          selected={selected}
 *          onItemClick={onItemClick}>
 *             {children}
 *       </CustomTabBar>
 *
 * @example <caption>Shorthand syntax can be used once function arguments and component properties names match.</caption>
 *    args => <CustomTabBar {...args}>{args.children}</CustomTabBar>
 *
 * @example <caption>Usage of build-in {@link widget-components.FixedList|FixedList} component as tab bar.</caption>
 *    args => <FixedList {...args}>{args.children}</FixedList>
 *
 * @example <caption>Advanced usage of {@link widget-components.ScrolledList|ScrolledList} component as tab bar.</caption>
 *    args =>
 *       <ScrolledList
 *          {...args}
 *          alignItems={ScrolledList.ALIGN_ITEMS.LEFT}
 *          step={3}>
 *             {args.children}
 *       </ScrolledList>
 */

/**
 * @name TabPagination_RenderTabListArgs
 * @property {number} selected Initially selected list item (tab)
 * @property {function(number)} onItemClick Item clicked handler. Called with item's index argument.
 * @property {ReactElement[]} children Array of list items (tabs)
 */

/**
 * @property [children] {ReactElement[]} Tab content elements
 * @property [renderTab] {TabPagination_RenderTab} Function called in order to render single tab on tab bar. Renders tab index by default.
 * @property [renderTabList] {TabPagination_RenderTabList} Function called in order to render tab bar. Renders {@link widget-components.ScrolledList|ScrolledList} by default.
 * @property [selected=0] {number} Currently selected tab index
 */
TabPagination.propTypes = {
   children: PropTypes.node,
   renderTab: PropTypes.func,
   renderTabList: PropTypes.func,
   selected: PropTypes.number
};

TabPagination.defaultProps = {
   renderTab: idx => <div key={idx}><strong>{idx}</strong></div>,
   renderTabList: (args) => <ScrolledList {...args}>{args.children}</ScrolledList>,
   selected: 0
};

export default TabPagination;
