'use strict';
import React from 'react';
import { connect } from 'react-redux';
import { PropTypes as T } from 'prop-types';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { DateTime } from 'luxon';

import { environment } from '../../config';
import { getSurgeAlerts } from '../../actions';
import BlockLoading from '../block-loading';

import Fold from '../fold';

const alertTypes = {
  0: 'FACT',
  1: 'SIMS',
  2: 'ERU',
  3: 'DHEOps',
  4: 'HEOps',
  5: 'SURGE'
};

class AlertsTable extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      page: 1
    };
    this.handlePageChange = this.handlePageChange.bind(this);
  }

  componentDidMount () {
    this.requestResults();
  }

  requestResults () {
    this.props._getSurgeAlerts(this.state.page);
  }

  handlePageChange (page) {
    this.setState({ page: page.selected + 1 }, () => {
      this.requestResults();
    });
  }

  renderRow (rowData, idx, all) {
    const isLast = idx === all.length - 1;

    const date = DateTime.fromISO(rowData.created_at);

    return (
      <React.Fragment key={rowData.id}>
        <tr>
          <td data-heading='Date'>{date.toISODate()}</td>
          <td data-heading='Emergency'><Link className='link--primary' to='' title='View Emergency page'>{rowData.operation}</Link></td>
          <td data-heading='Alert Message'>{rowData.message}</td>
          <td data-heading='Type'>{alertTypes[rowData.atype]}</td>
        </tr>

        {!isLast && (
          <tr role='presentation'>
            <td colSpan='4'></td>
          </tr>
        )}
      </React.Fragment>
    );
  }

  renderLoading () {
    if (this.props.surgeAlerts.fetching) {
      return <BlockLoading/>;
    }
  }

  renderError () {
    if (this.props.surgeAlerts.error) {
      return <p>Oh no! An error ocurred getting the data.</p>;
    }
  }

  renderContent () {
    const {
      data,
      fetched,
      error
    } = this.props.surgeAlerts;

    if (!fetched || error) { return null; }

    if (!data.objects.length) {
      return (
        <p>There are no results to show.</p>
      );
    }

    return (
      <React.Fragment>
        <table className='responsive-table alerts-table'>
          <thead>
            <tr>
              <th>Date</th>
              <th>Emergency</th>
              <th>Alert Message</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {data.objects.map(this.renderRow)}
          </tbody>
        </table>

        {data.objects.length !== 0 && (
          <div className='pagination-wrapper'>
            <ReactPaginate
              previousLabel={<span>previous</span>}
              nextLabel={<span>next</span>}
              breakLabel={<span className='pages__page'>...</span>}
              pageCount={Math.ceil(data.meta.total_count / data.meta.limit)}
              forcePage={data.meta.offset / data.meta.limit}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={this.handlePageChange}
              containerClassName={'pagination'}
              subContainerClassName={'pages'}
              pageClassName={'pages__wrapper'}
              pageLinkClassName={'pages__page'}
              activeClassName={'active'} />
          </div>
        )}
      </React.Fragment>
    );
  }

  render () {
    return (
      <Fold title='Latest Alerts'>
        {this.renderLoading()}
        {this.renderError()}
        {this.renderContent()}
      </Fold>
    );
  }
}

if (environment !== 'production') {
  AlertsTable.propTypes = {
    _getSurgeAlerts: T.func,
    surgeAlerts: T.object
  };
}

// /////////////////////////////////////////////////////////////////// //
// Connect functions

const selector = (state) => ({
  surgeAlerts: state.surgeAlerts
});

const dispatcher = (dispatch) => ({
  _getSurgeAlerts: (...args) => dispatch(getSurgeAlerts(...args))
});

export default connect(selector, dispatcher)(AlertsTable);