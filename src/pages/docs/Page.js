
import React from 'react';
import Marked from '../../components/Marked';
// import { fetchStaticContent} from '../../helpers/fetchStatic';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import DocumentMeta from 'react-document-meta';
import config from '../../options';
import storage from '../../storage/storage';
import { contentLoaded } from '../../redux/modules/content';

class Page extends React.Component {
  static propTypes = {
    content: React.PropTypes.string,
    location: React.PropTypes.object,
    params: React.PropTypes.object,
    docIndex: React.PropTypes.object,
  };

  static fetchData(getState, dispatch, location) {
    return storage.load({
      key: 'docContent',
      id: location.pathname.replace(/\.html$/, ''),
    }).then(data => dispatch(contentLoaded(data)));
  }

  componentDidMount() {
    const { location } = this.props;
    setTimeout(() => {
      this.renderDuoshuo(this.refs.duoshuo, location.pathname);
    }, 1000); // why?
  }

  componentWillReceiveProps(nextProps) {
    const { location } = nextProps;
    if (location.pathname !== this.threadKey) {
      this.renderDuoshuo(this.refs.duoshuo, location.pathname);
    }
  }

  renderDuoshuo = (container, tkey) => {
    const { location } = this.props;
    var el = document.createElement('div');
    el.setAttribute('data-thread-key', tkey);
    el.setAttribute('data-author-key', '325758');
    DUOSHUO.EmbedThread(el);
    container.innerHTML = '';
    container.appendChild(el);
    this.threadKey = tkey;
  };

  render() {
    const { location, params, docIndex, content } = this.props;
    let hash = location.hash;
    hash = hash && hash.substr(1);

    const curId = params.docid.replace(/\.html$/, '');

    let indexes = docIndex.contains;
    indexes = indexes.reduce((prev, cur) => prev.concat(cur.contains), []);

    const curr = indexes.filter(v => v.mdlink === curId)[0];

    const currIndex = indexes.indexOf(curr);

    const prev = currIndex >= 0 && indexes[currIndex - 1];
    const next = currIndex >= 0 && indexes[currIndex + 1];

    const title = content && curr && curr.subject || '';

    const gitLink = content && curr &&
                      `https://github.com/reactnativecn/react-native-docs-cn/blob/master/docs/${params.version}/${curr.mdlink}.md`;

    return (
      <div>
        <DocumentMeta
          {...config.app}
          title={title ? `${title} - react native 中文网` : 'react native 中文网'}
        />
        <a className="anchor" name="content" />
        <h1>{title}</h1>
        { gitLink && <a className="edit-github" href={gitLink}>在GitHub上修改这篇文档</a> }
        <section className="content">
          <Marked uri={`/static/docs/${params.version}/`} scrollTo={hash} createHashLink>
            {content}
          </Marked>
          <Row className="prevNextRow">
            {prev && <Col xs={3} md={3} mdOffset={9} xsOffset={7}>
              <Link
                className="nextprevLink"
                to={{ pathname: `/docs/${params.version}/${prev.mdlink}.html` }}
              >
                前一篇：{prev.subject}
              </Link>
            </Col>}
            {next && <Col xs={3} md={3} mdOffset={9} xsOffset={7}>
              <Link
                className="nextprevLink"
                to={{ pathname: `/docs/${params.version}/${next.mdlink}.html` }}
              >
                后一篇：{next.subject}
              </Link>
            </Col>}
          </Row>
        </section>
        <div ref="duoshuo"></div>
      </div>
    );
  }
}
export default connect(state => ({
  content: state.content,
  docIndex: state.docIndex,
}))(Page);
