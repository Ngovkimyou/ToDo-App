import {Link} from "react-router-dom";
import "./About.css"

function About() {
  return (
    <div className="about-page">
      <h1 className="page-title">About</h1>

      <div className="about-content">
        {/*project description*/}
        <section className="about-section">
          <h2 className="section-title">ToDo App</h2>
          <p className="section-description">
            ToDo App is developed by a group of students in the purpose of making a viable website for users to keep track of their works and tasks effectively. It is designed with minimal but breathtaking style to help users focus and organzie their future events.
          </p>
        </section>

        <section className="about-section">
          <h3 className="subsection-title">Instructor</h3>
          <div className="instructor-card">
            <span className="instructor-name">Singhtararaksmey (Joe) Chea</span>
          </div>
        </section>
        <section className="about-section">
          <h3 className="subsection-title">Project Team</h3>
          
          <div className="team-grid">

            <div className="team-card team-leader">
              <div className="team-role">Team Leader</div>
              <div className="team-name">Kimyou Ngov</div>
              <div className="team-tasks">
                <span className="task-tag">UI/UX Design</span>
                <span className="task-tag">Home Page</span>
                <span className="task-tag">Task Creation Page</span>
                <span className="task-tag">Navigation Bar</span>
              </div>
            </div>
          </div>

          <div className="team-card">
            <div className="team-role">Team Member</div>
            <div className="team-name">Phearith Heng</div>
            <div className="team-tasks">
                <span className="task-tag">Calendar Page</span>
                <span className="task-tag">Recycle-bin Page</span>
              </div>
          </div>

          <div className="team-card">
            <div className="team-role">Team Member</div>
            <div className="team-name">Kimseng Touch</div>
            <div className="team-tasks">
                <span className="task-tag">About Page</span>
                <span className="task-tag">Report File</span>
              </div>
          </div>
        </section>

        <section className="about-section">
          <h3 className="subsection-title">Technologies &amp; Tools </h3>
          <div className="tech-grid">
            <div className="tech-card">
              <span className="tech-category">Design</span>
              <span className="tech-item">Figma</span>
            </div>
            
            <div className="tech-card">
              <span className="tech-category">Frontend Framework</span>
              <span className="tech-item">React</span>
            </div>

            <div className="tech-card">
              <span className="tech-category">Deployment Platform</span>
              <span className="tech-item">Vercel</span>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h3 className="subsection-title">Reference &amp; Assets</h3>
          <div className="reference-card">
            <p className="reference-text">
              All icons and assection in this project are sourced from
              <a 
                  href="https://heroicons.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="reference-link"
                >
                  Heroicons
                </a>
                and 
                <a 
                  href="https://fonts.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="reference-link"
                >
                  Google Fonts
                </a>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    );    
}


export default About;