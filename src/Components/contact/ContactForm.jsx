import React, { useState, useRef } from 'react';
import { Box, MenuItem, Alert } from '@mui/material';
import emailjs from '@emailjs/browser';
import FormField from '../common/FormField';
import PrimaryButton from '../common/PrimaryButton';
import { TextField } from '@mui/material';

// TODO: replace with your EmailJS service ID / template ID / public key from https://dashboard.emailjs.com
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

const ContactForm = () => {
  const form = useRef();
  const [status, setStatus] = useState({ submitting: false, success: false, error: false });
  const [errors, setErrors] = useState({});

  const validate = (formData) => {
    const newErrors = {};
    if (!formData.get('user_name')) newErrors.name = true;
    const email = formData.get('user_email');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = true;
    if (!formData.get('message')) newErrors.message = true;
    return newErrors;
  };

  const sendEmail = (e) => {
    e.preventDefault();
    
    const formData = new FormData(form.current);
    const newErrors = validate(formData);
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setStatus({ submitting: true, success: false, error: false });

    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
       // Mocking the request if keys aren't set
       setTimeout(() => {
           setStatus({ submitting: false, success: true, error: false });
           form.current.reset();
       }, 1500);
       return;
    }

    emailjs
      .sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        form.current,
        {
          publicKey: EMAILJS_PUBLIC_KEY,
        }
      )
      .then(
        () => {
          setStatus({ submitting: false, success: true, error: false });
          form.current.reset();
        },
        (error) => {
          console.error('FAILED...', error.text);
          setStatus({ submitting: false, success: false, error: true });
        }
      );
  };

  return (
    <Box 
      component="form" 
      ref={form} 
      onSubmit={sendEmail}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 3 
      }}
    >
      {status.success && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Message sent! We'll get back to you soon.
        </Alert>
      )}
      
      {status.error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Something went wrong. Please try again or email us directly at info@verifyhub.in.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
        <FormField 
          label="Your Name" 
          name="user_name"
          id="user_name"
          placeholder="Enter your name" 
          required 
          error={errors.name}
          sx={{ flex: 1 }}
        />
        <FormField 
          label="Email Address" 
          name="user_email"
          id="user_email"
          type="email" 
          placeholder="Enter your email" 
          required 
          error={errors.email}
          sx={{ flex: 1 }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
        <FormField 
          label="Company" 
          name="company"
          id="company"
          placeholder="Company name" 
          sx={{ flex: 1 }}
        />
        <FormField 
          label="Subject" 
          name="subject"
          id="subject"
          select
          defaultValue="General Inquiry"
          sx={{ flex: 1 }}
        >
          <MenuItem value="General Inquiry">General Inquiry</MenuItem>
          <MenuItem value="Sales">Sales</MenuItem>
          <MenuItem value="Technical Support">Technical Support</MenuItem>
          <MenuItem value="Partnership">Partnership</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </FormField>
      </Box>
      
      <FormField 
        label="Message" 
        name="message"
        id="message"
        multiline
        rows={4}
        placeholder="How can we help?" 
        required 
        error={errors.message}
      />

      <PrimaryButton 
        type="submit" 
        disabled={status.submitting}
        sx={{ mt: 1, py: 1.5, alignSelf: 'flex-start' }}
      >
        {status.submitting ? 'Sending...' : 'Send Message'}
      </PrimaryButton>
    </Box>
  );
};

export default ContactForm;
