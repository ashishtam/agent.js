const React = require('react')
const { translate } = require('../../server/translate.js')
const {
  Container,
  GridBlock,
  MarkdownBlock
} = require('../../core/CompLibrary.js')
const { baseUrl, users, title } = require(process.cwd() + '/siteConfig.js')

const imgUrl = img => `${baseUrl}img/${img}`
const docUrl = (doc, language) =>
  `${baseUrl}docs/${language ? language + '/' : ''}${doc}`
const pageUrl = (page, language) =>
  `${baseUrl}${language ? language + '/' : ''}${page} `
const Button = ({ href, target, children }) => (
  <div className='pluginWrapper buttonWrapper'>
    <a className='button' href={href} target={target || '_self'}>
      {children}
    </a>
  </div>
)

const SplashContainer = ({ children }) => (
  <div className='homeContainer'>
    <div className='homeSplashFade'>
      <div className='wrapper homeWrapper'>{children}</div>
    </div>
  </div>
)

const Logo = ({ img_src: src }) => (
  <div className='projectLogo'>
    <img src={src} />
  </div>
)

const PromoSection = ({ children }) => (
  <div className='section promoSection'>
    <div className='promoRow'>
      <div className='pluginRowBlock'>{children}</div>
    </div>
  </div>
)

const HomeSplash = ({ language }) => (
  <SplashContainer>
    <Logo img_src={imgUrl('logo.svg')} />
    <div className='inner'>
      <PromoSection>
        <Button href={docUrl('getting-started.html', language || '')}>
          <translate>Getting Started</translate>
        </Button>
        <Button href={docUrl('plugins.html', language || '')}>
          <translate>Plugins</translate>
        </Button>
        <Button href={docUrl('integrations.html', language || '')}>
          <translate>Integrations</translate>
        </Button>
      </PromoSection>
    </div>
  </SplashContainer>
)

const Block = ({ id, background, children, layout }) => (
  <Container className='productShowcaseSection' background={background}>
    <GridBlock align='center' contents={children} layout={layout} />
  </Container>
)

const Features = props => (
  <div className='toolSection'>
    <Block layout='fourColumn' background='dark'>
      {[
        {
          content: 'This is the content of my feature',
          image: imgUrl('pic01.png'),
          imageAlign: 'top',
          title: 'Feature One'
        },
        {
          content: 'The content of my second feature',
          image: imgUrl('pic02.png'),
          imageAlign: 'top',
          title: 'Feature Two'
        }
      ]}
    </Block>
  </div>
)

const FeatureCallout = props => (
  <div className='productShowcaseSection functionSection'>
    <h2>Feature Callout</h2>
    <MarkdownBlock>These are features of this project</MarkdownBlock>
  </div>
)

const LearnHow = props => (
  <Block background='dark'>
    {[
      {
        content: 'Talk about learning how to use this',
        image: imgUrl('docusaurus.svg'),
        imageAlign: 'right',
        title: 'Learn How'
      }
    ]}
  </Block>
)

const TryOut = props => (
  <Block id='try'>
    {[
      {
        content: 'Talk about trying this out',
        image: imgUrl('docusaurus.svg'),
        imageAlign: 'left',
        title: 'Try it Out'
      }
    ]}
  </Block>
)

const Description = props => (
  <Block background='dark'>
    {[
      {
        content: 'This is another description of how this project is useful',
        image: imgUrl('docusaurus.svg'),
        imageAlign: 'right',
        title: 'Description'
      }
    ]}
  </Block>
)

const Showcase = ({ language }) => {
  if ((users || []).length === 0) {
    return null
  }
  const showcase = users
    .filter(user => {
      return user.pinned
    })
    .map((user, i) => {
      return (
        <a href={user.infoLink} key={i}>
          <img src={user.image} title={user.caption} />
        </a>
      )
    })

  return (
    <div className='productShowcaseSection paddingBottom'>
      <h2>{"Who's Using This?"}</h2>
      <p>This project is used by all these people</p>
      <div className='logos'>{showcase}</div>
      <div className='more-users'>
        <a className='button' href={pageUrl('users.html', language)}>
          More {title} Users
        </a>
      </div>
    </div>
  )
}

module.exports = function Index ({ language }) {
  return (
    <div>
      <HomeSplash language={language || ''} />
      <div className='mainContainer'>
        <Features />
        <FeatureCallout />
        <div className='collaborationSection'>
          <LearnHow />
          <TryOut />
          <Description />
        </div>
        <Showcase language={language || ''} />
      </div>
    </div>
  )
}
