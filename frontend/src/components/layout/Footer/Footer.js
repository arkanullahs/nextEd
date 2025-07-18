import './Footer.css'
import logo from '../navigation/logo3.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <img src={logo} alt="Logo" />
          <h2>NextEd</h2>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h3>COURSES</h3>
            <ul>
              <li><a href="/">PROGRAMMING</a></li>
              <li><a href="/">DATA SCIENCE</a></li>
              <li><a href="/">BUSINESS</a></li>
              <li><a href="/">DESIGN</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>COMPANY</h3>
            <ul>
              <li><a href="/">ABOUT US</a></li>
              <li><a href="/">CAREERS</a></li>
              <li><a href="/">BLOG</a></li>
              <li><a href="/">PARTNERS</a></li>
              <li><a href="/">CONTACT US</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>COMMUNITY</h3>
            <ul>
              <li>
                <a href="/">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  LINKEDIN
                </a>
              </li>
              <li>
                <a href="/">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                  TWITTER
                </a>
              </li>
              <li>
                <a href="/">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                  FACEBOOK
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Empowering learners worldwide with cutting-edge online courses and personalized learning experiences.</p>
        <div className="footer-bottom-links">
          <a href="/">HELP CENTER</a>
          <a href="/">TERMS OF SERVICE</a>
        </div>
      </div>
      <div className="footer-accent"></div>
    </footer>
  )
}

export default Footer
