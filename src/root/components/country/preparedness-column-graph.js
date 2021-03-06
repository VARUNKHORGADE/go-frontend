
import React from 'react';
import { environment } from '#config';
import { PropTypes as T } from 'prop-types';
import { getPerComponent } from '#utils/get-per-components';
import Fold from './../fold';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { connect } from 'react-redux';
import RequestFactory from './../per-forms/factory/request-factory';
import LanguageContext from '#root/languageContext';

class PreparednessColumnBar extends React.Component {
  constructor (props) {
    super(props);
    this.formIds = {};
    this.requestFactory = new RequestFactory();
  }

  buildDataForGraph () {
    const filteredData = this.props.getPerForm.data.results.filter((component) => {
      return component.selected_option > 1;
    }).map((component) => {
      component.formCode = this.formIds[component.form].code;
      const perComponent = getPerComponent(component.formCode, component.question_id);
      component.name = perComponent ? perComponent.name : 'n/a';
      component.epi = 0;
      component.component = 0;
      component.groupingKeyword = component.question_id.includes('epi')
        ? component.formCode + component.question_id.split('epi')[0]
        : component.formCode + component.question_id.split('q')[0];
      return component;
    });
    return filteredData;
  }

  buildFormCodes () {
    this.props.getPerForms.data.results.forEach((document) => {
      this.formIds[document.id] = document;
    });
  }

  buildGroupedData (mappedData) {
    const groupedData = {};
    mappedData.forEach((answer) => {
      if (typeof groupedData[answer.groupingKeyword] === 'undefined') {
        groupedData[answer.groupingKeyword] = JSON.parse(JSON.stringify(answer));
      }
      if (answer.question_id.includes('epi')) {
        groupedData[answer.groupingKeyword].epi = answer.selected_option;
      } else {
        groupedData[answer.groupingKeyword].component = answer.selected_option;
      }
    });
    return groupedData;
  }

  render () {
    const  {strings } = this.context;
    if (!this.props.getPerForm.fetched || !this.props.getPerForms.fetched || !this.props.user.username || typeof this.props.getPerForms.data.results === 'undefined') return null;
    if (typeof this.props.getPerForm.data.count !== 'undefined' && this.props.getPerForm.data.count === 0 &&
      typeof this.props.getPerForm.data.count !== 'undefined' && this.props.getPerForm.data.count === 0) return null;
    this.buildFormCodes();
    const tmpData = this.buildDataForGraph();
    const groupedData = this.buildGroupedData(tmpData);
    return (
      <Fold id='per-column-graph' title={strings.preparednessColumnGraphTitle} foldWrapperClass='preparedness' foldTitleClass='margin-reset'>
        <div style={{width: 'fit-content', margin: 'auto'}}>
          <BarChart
            width={900}
            height={300}
            data={Object.values(groupedData)}
            margin={{
              top: 5, right: 40, left: 40, bottom: 5
            }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey='name' hide />
            <YAxis type='number' ticks={[2, 3, 4, 5, 6, 7]} tickFormatter={(number) => this.requestFactory.numAnswerToString(number)} />
            <Tooltip formatter={(number) => number > 1 ? this.requestFactory.numAnswerToString(number) : 'No data'} />
            <Legend iconType='circle' />
            <Bar dataKey="epi" fill="#7e95ba" />
            <Bar dataKey="component" fill="#24334c" />
          </BarChart>
        </div>
      </Fold>
    );
  }
}

if (environment !== 'production') {
  PreparednessColumnBar.propTypes = {
    getPerNsPhase: T.object,
    perOverviewForm: T.object,
    getPerForm: T.object,
    getPerForms: T.object,
    user: T.object
  };
}

const selector = (state) => ({
  user: state.user.data
});

const dispatcher = (dispatch) => ({
  _getPerNsPhase: () => dispatch('getPerNsPhase()')
});

PreparednessColumnBar.contextType = LanguageContext;
export default connect(selector, dispatcher)(PreparednessColumnBar);
