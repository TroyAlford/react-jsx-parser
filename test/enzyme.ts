/* eslint-disable import/no-extraneous-dependencies */
import Enzyme from 'enzyme'
import Adapter from '@cfaester/enzyme-adapter-react-18'
/* eslint-enable import/no-extraneous-dependencies */

Enzyme.configure({ adapter: new Adapter() })
