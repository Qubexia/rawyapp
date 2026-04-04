import { createRecordingEpisode } from '../episodes.service';
import axiosClient from '../axios-client';

jest.mock('../axios-client', () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ data: { _id: 'ep1', title: 'Test' } }),
  },
  UPLOAD_TIMEOUT: 60000,
}));

describe('episodes.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('T034: createRecordingEpisode converts URI to FormData and uploads correctly', async () => {
    const payload = {
      title: 'My Recording',
      description: 'A test recording',
      podcastId: 'pod1',
      duration: 120,
    };
    
    const recordingUri = 'file:///data/user/0/com.app/cache/recording-123.m4a';
    const onProgress = jest.fn();

    const result = await createRecordingEpisode(payload, recordingUri, null, onProgress);

    expect(result._id).toBe('ep1');
    expect(axiosClient.post).toHaveBeenCalledTimes(1);
    
    // Check arguments
    const [url, formData, config] = (axiosClient.post as jest.Mock).mock.calls[0];
    
    expect(url).toBe('/episodes');
    expect(config.headers['Content-Type']).toBe('multipart/form-data');
    expect(config.onUploadProgress).toBe(onProgress);
    
    // We cannot easily test FormData contents perfectly in JSDOM, 
    // but we can verify it's a FormData instance.
    expect(formData).toBeInstanceOf(FormData);
  });
});
