/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/no-danger */
/* eslint-disable no-alert */
import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { coreLibrary } from 'kambi-widget-core-library'
import reactElementToJSXString from 'react-element-to-jsx-string'
import {
  Header,
  TabPagination,
  ScrolledList,
  FixedList,
  ActionButton,
  IconHeader,
  Carousel,
  BlendedBackground,
} from './components'

const TestContainer = ({ description, element }) => {
  const elementString = reactElementToJSXString(element, {
    showDefaultProps: false,
    showFunctions: true,
    tabStop: 3,
    useBooleanShorthandSyntax: false,
  })

  return (
    <div className="test-container">
      <div className="header">
        <h2>{element.type.name}</h2>
        {description}
      </div>
      <div className="code">
        <h3>Code</h3>
        <pre>
          <code
            className="language-html"
            dangerouslySetInnerHTML={{
              __html: window.Prism.highlight(
                elementString,
                window.Prism.languages.html
              ),
            }}
          />
        </pre>
      </div>
      <div className="example">
        <h3>Working example</h3>
        <div className="component">{element}</div>
      </div>
    </div>
  )
}

TestContainer.propTypes = {
  description: PropTypes.string.isRequired,
  element: PropTypes.element,
}

const render = function(description, element) {
  const div = document.createElement('div')
  document.body.append(div)
  ReactDOM.render(
    <TestContainer description={description} element={element} />,
    div
  )
}

coreLibrary.init({}).then(() => {
  render(
    '',
    <Carousel height={230} autoPlay>
      <div style={{ width: '100%', height: '100%', backgroundColor: 'blue' }} />
      <div
        style={{ width: '100%', height: '100%', backgroundColor: 'green' }}
      />
      <div style={{ width: '100%', height: '100%', backgroundColor: 'red' }} />
    </Carousel>
  )

  render(
    'IconHeader with icon',
    <IconHeader
      iconCSSClasses="KambiWidget-card-border-color"
      iconPath="http://vector.stylove.com/images/small_1821.jpg"
      subtitle="Example Subtitle"
      title="Example Title"
    />
  )

  render(
    'Header with kambi default black background, header should be 40px in height',
    <Header customClasses="l-flexbox l-pl-16 l-pr-16 KambiWidget-card-support-text-color KambiWidget-header l-pt-8 l-pb-8">
      <span>Lorem ipsum dolor sit amet</span>
    </Header>
  )

  render(
    'Tab Pagination component',
    <TabPagination>
      <div>Item #1</div>
      <div>Item #2</div>
      <div>Item #3</div>
      <div>Item #4</div>
      <div>Item #5</div>
      <div>Item #6</div>
      <div>Item #7</div>
      <div>Item #8</div>
      <div>Item #9</div>
      <div>Item #10</div>
    </TabPagination>
  )

  render(
    'Scrolled List component with custom alignment of items (ScrolledList.ALIGN_ITEMS.SPACE_AROUND)',
    <ScrolledList alignItems={ScrolledList.ALIGN_ITEMS.SPACE_AROUND}>
      <div>Item #1</div>
      <div>Item #2</div>
      <div>Item #3</div>
      <div>Item #4</div>
      <div>Item #5</div>
      <div>Item #6</div>
      <div>Item #7</div>
      <div>Item #8</div>
      <div>Item #9</div>
      <div>Item #10</div>
    </ScrolledList>
  )

  render(
    'Fixed List component',
    <FixedList>
      <div>Item #1</div>
      <div>Item #2</div>
      <div>Item #3</div>
    </FixedList>
  )

  render(
    'Primary ActionButton',
    <ActionButton
      action={() => {
        alert('this is the ActionButton action')
      }}
      type="primary"
      disabled={false}
    >
      place your bet
    </ActionButton>
  )

  render(
    'Disabled Primary ActionButton',
    <ActionButton
      action={() => {
        alert('this is the ActionButton action')
      }}
      type="primary"
      disabled={true}
    >
      place your bet
    </ActionButton>
  )

  render(
    'Secondary ActionButton',
    <ActionButton
      action={() => {
        alert('this is the ActionButton action')
      }}
      type="secondary"
      disabled={false}
    >
      add
    </ActionButton>
  )

  render(
    'Disabled Secondary ActionButton',
    <ActionButton
      action={() => {
        alert('this is the ActionButton action')
      }}
      type="secondary"
      disabled={true}
    >
      add
    </ActionButton>
  )

  render(
    'Carousel with 3 images',
    <Carousel
      height={350}
      onCarouselMouseEnter={(enterTime, itemId) =>
        console.log(enterTime, ', ', itemId)
      }
      onCarouselItemClick={itemId => console.log(itemId)}
      items={[
        {
          itemId: 1,
          imagePath: 'http://lorempixel.com/600/400/sports/1/',
          redirectUrl: 'http://lorempixel.com/',
          imagePositionX: 'left',
          imagePositionY: 'center',
        },
        {
          itemId: 2,
          imagePath: 'http://lorempixel.com/600/400/sports/2/',
          redirectUrl: 'http://lorempixel.com/',
          imagePositionX: 'left',
          imagePositionY: 'center',
        },
      ]}
    />
  )

  render(
    'BlendedBackground example - used for match and tournament overviews',
    <div>
      <BlendedBackground
        backgroundUrl={'https://cdn.viagogo.net/img/cat/2/1/37.jpg'}
      />
      <div style={{ height: '300px' }} />
    </div>
  )
})
