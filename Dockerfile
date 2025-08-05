FROM node
WORKDIR /renewa_bot
COPY . /renewa_bot
RUN ["npm","install","--force","-g","yarn"]
RUN ["yarn","install"]
CMD ["yarn","start"]