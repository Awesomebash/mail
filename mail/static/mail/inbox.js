document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

//TODO: Send Mail, Mailbox, Email View, Archive, Reply

function clear_all() {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none'
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('#single-email-view').innerHTML = "";
}

function compose_email() {

  // Show compose view and hide other views
  clear_all()
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-submit').addEventListener('click', submit_email)
}

function load_mailbox(mailbox) {
  //inbox, sent, archive
  clear_all()
  document.querySelector('#emails-view').style.display = 'block';

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      email.forEach(mail => {
        let element = document.createElement('div');
        element.id = 'email-container-' + mail.id
        let header = document.createElement('h3')
        let body = document.createElement('p')
        let sender = document.createElement('h5')
        header.innerHTML = mail.subject
        body.innerHTML = mail.body
        sender.innerHTML = mail.sender
        element.append(header, sender, body)
        element.style.borderStyle = 'solid';
        if (mail.read){
          element.style.backgroundColor = 'grey';
        }
        element.addEventListener('click', view_email)
        document.querySelector('#emails-view').append(element);
      });
      console.log(email)
  });

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function submit_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result)
  });
}

function view_email(evt) {
  //inbox, sent, archive
  clear_all()
  document.querySelector('#single-email-view').style.display = 'block';

  let viewedId = parseInt(evt.currentTarget.id.slice(16))
  fetch(`/emails/${viewedId}`)
  .then(response => response.json())
  .then(mail => {
    // Print email
    let element = document.createElement('div');
    element.id = 'email-container-' + mail.id
    let header = document.createElement('h3')
    let body = document.createElement('p')
    let sender = document.createElement('h5')
    let timestamp = document.createElement('p')
    let archiveButton = document.createElement('button')
    let replyButton = document.createElement('button')
    
    if (mail.archived) {
      archiveButton.innerHTML = "Unarchive"
      archiveButton.id = `unarchive-${mail.id}`
    }else{
      archiveButton.innerHTML = "Archive"
      archiveButton.id = `archive-${mail.id}`
    }

    replyButton.id = `reply-button-${mail.id}`
    replyButton.innerHTML = "Reply"

    archiveButton.addEventListener('click', archive_email)
    replyButton.addEventListener('click', reply_email)
    
    header.innerHTML = mail.subject
    body.innerHTML = mail.body
    sender.innerHTML = mail.sender
    timestamp.innerHTML = mail.timestamp
    element.append(header, sender, body, timestamp, archiveButton, replyButton)

    element.style.borderStyle = 'solid';
    if (mail.read){
      element.style.backgroundColor = 'grey';
    }

    document.querySelector('#single-email-view').append(element);
    console.log(mail)
  });

  fetch(`/emails/${viewedId}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function reply_email(evt) {
  compose_email()
  let viewedId = parseInt(evt.currentTarget.id.slice(13))
  fetch(`/emails/${viewedId}`)
  .then(response => response.json())
  .then(mail => {
    if (mail.subject.slice(0, 3).toUpperCase() === "RE:") {
      document.querySelector('#compose-subject').value = mail.subject;
    } else {
      document.querySelector('#compose-subject').value = `Re:${mail.subject}`;
    }
    document.querySelector('#compose-recipients').value = mail.sender;
    document.querySelector('#compose-body').value = `\nOn ${mail.timestamp} ${mail.sender} wrote:\n${mail.body}`;
  })



}

function archive_email(evt) {
  if(evt.currentTarget.id.slice(0, 7) === `archive`){
    fetch(`/emails/${evt.currentTarget.id.slice(8)}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    .then(load_mailbox('inbox'))
  }else{
    fetch(`/emails/${evt.currentTarget.id.slice(10)}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    .then(load_mailbox('inbox'))
  }
}