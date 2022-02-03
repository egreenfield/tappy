import Layout from '../components/layout'
import Sidebar from '../components/sidebar'

export default function Index() {
  return (
    <section>
    </section>
  )
}

Index.getLayout = function getLayout(page) {
  return (
    <Layout selected=''>
      {page}
    </Layout>
  )
}
