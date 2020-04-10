import Layout from '../../components/MyLayout';

const Index = props => {
  return (
    <Layout>
      <p>Hello Next.js</p>
    </Layout>
  );
  <style jsx>{`
    p {
      color: red;
    }
      `}</style>
}

// used to fetch data or something? 
Index.getInitialProps = async function() {
  const res = await fetch('');
  const data = await res.json();

  return {
    userData: data
  };
};

export default Index;