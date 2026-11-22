export default function NewsletterSignup() {
  return <div style={{minWidth:0,width:"100%"}}>
    <iframe title="Subscribe to the All Things Gwinnett newsletter" loading="lazy"
      src="https://subscribe-forms.beehiiv.com/b38f40a3-6d50-4ce7-b8af-18396ae74771"
      style={{width:"100%",height:260,border:0,background:"#fff"}} />
    <a className="text-link" href="https://allthingsgwinnett.beehiiv.com/subscribe" target="_blank" rel="noopener noreferrer">Open the newsletter signup ↗</a>
  </div>;
}